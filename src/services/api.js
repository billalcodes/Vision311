//const API_URL = 'http://10.0.2.2:5000/api'; // Use this for Android emulator
const API_URL = 'http://172.20.10.2:5000/api'; // Change this to your local API URL
const API_BASE_URL = 'http://172.20.10.2:5000'; // Base URL without /api suffix
const SENTIMENT_API_URL = 'http://127.0.0.1:8001/predict'; // Sentiment analysis API

// Store JWT token
let token = '';

export const setToken = (userToken) => {
  token = userToken;
};

// Helper function to get full image URL
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;

  console.log('Processing image path in getFullImageUrl:', imagePath);

  if (imagePath.startsWith('http')) {
    // Already a full URL
    return imagePath;
  } else if (imagePath.startsWith('/api/uploads/')) {
    // MongoDB stored image
    return `${API_BASE_URL}${imagePath}`;
  } else if (imagePath.startsWith('/uploads/')) {
    // File system stored image
    return `${API_BASE_URL}${imagePath}`;
  } else if (imagePath.startsWith('file://')) {
    // Local file - this should only be used for temporary display before upload
    return imagePath;
  }

  console.warn('Unknown image path format:', imagePath);
  return null;
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const uploadImage = async (imageUri) => {
  try {
    // Check if token is available
    if (!token) {
      console.error('Authentication token is missing');
      throw new Error('Authentication token is missing');
    }

    // Create a FormData object for the image
    const formData = new FormData();

    // Parse the image URI to get file information
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'jpg'; // Default to jpg if no extension

    // Append the image to FormData
    formData.append('file', {
      uri: imageUri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    console.log('Uploading image to main server:', API_URL + '/uploads');

    // Send the image to your main server (port 5000)
    const uploadResponse = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - it's set automatically with boundary
      },
      body: formData,
    });

    console.log('Upload response status:', uploadResponse.status);

    // Get the full response text for better debugging
    const responseText = await uploadResponse.text();
    let uploadResult;

    try {
      uploadResult = JSON.parse(responseText);
      console.log('Upload response parsed:', uploadResult);
    } catch (e) {
      console.error('Error parsing upload response:', e);
      console.log('Raw response:', responseText);
      throw new Error('Invalid server response format');
    }

    if (!uploadResponse.ok) {
      console.error('Image upload error response:', uploadResult);
      throw new Error(`Upload server error: ${uploadResponse.status}`);
    }

    if (!uploadResult.success || !uploadResult.imagePath) {
      throw new Error('Upload succeeded but no image path was returned');
    }

    console.log('Image successfully uploaded, server path:', uploadResult.imagePath);
    return uploadResult.imagePath; // Return the server path to the uploaded image
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

// Modified analyzeImage function that first uploads the image
const analyzeImage = async (imageUri) => {
  setIsAnalyzing(true);
  setPredictions([]);
  setSelectedIssue(null);

  try {
    // First upload the image to our server
    let uploadedPath = null;
    try {
      uploadedPath = await uploadImage(imageUri);
      setUploadedImagePath(uploadedPath);
      console.log('Image uploaded to server path:', uploadedPath);
    } catch (uploadError) {
      console.warn('Failed to upload image to server, continuing with direct analysis:', uploadError);
      // Continue with analysis even if upload fails
    }

    // Create a new FormData object for the ML analysis
    const formData = new FormData();

    // Append the image to the FormData object
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('file', {
      uri: imageUri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    if (uploadedPath) {
      // If we have a server path, include it so the ML service can reference it
      formData.append('serverPath', uploadedPath);
    }

    console.log('Analyzing image:', imageUri);

    // Use your computer's IP address instead of localhost
    const response = await fetch('http://172.20.10.2:8000/predict', {
      method: 'POST',
      body: formData,
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image analysis response error:', errorText);
      throw new Error(`Server error: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();
    console.log('Image analysis result:', data);

    // Set the predictions from the API response
    setPredictions(data.predictions || []);

    // If a server path is returned for the saved image, use it
    if (data.image_path) {
      setUploadedImagePath(data.image_path);
    } else if (uploadedPath) {
      // If ML service didn't return a path but we uploaded it successfully, use that
      setUploadedImagePath(uploadedPath);
    }
  } catch (error) {
    console.error("Error analyzing image:", error.message, error.stack);
    Alert.alert(
      "Analysis Error",
      `Connection issue: ${error.message}. Using placeholder data instead.`
    );

    // Set fallback data
    setPredictions([
      { label: "Pothole", confidence: 0.85 },
      { label: "Broken Sidewalk", confidence: 0.65 },
      { label: "Water Damage", confidence: 0.45 }
    ]);
  } finally {
    setIsAnalyzing(false);
  }
};
export const analyzeSentiment = async (feedback) => {
  try {
    console.log('Sending feedback for sentiment analysis:', feedback);

    // Option 1: If your API expects json={"text": "feedback"} format
    // Create a URLSearchParams object
    const params = new URLSearchParams();
    params.append('json', JSON.stringify({ text: feedback }));

    const response = await fetch(SENTIMENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error('Sentiment analysis response status:', response.status);
      const errorText = await response.text();
      console.error('Sentiment analysis error response:', errorText);
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Sentiment analysis result:', result);

    return result;
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    // For demo purposes, return a mock result if the API is unavailable
    return {
      sentiment: "Negative",
      result: "Thank you for your feedback! We're sorry to hear about your negative experience. We'll work to improve our service based on your feedback."
    };
  }
};
// Mock helpers for fallback
function getRandomIssueType() {
  const issueTypes = ["Pothole", "Broken Streetlight", "Graffiti", "Illegal Dumping", "Fallen Tree"];
  return issueTypes[Math.floor(Math.random() * issueTypes.length)];
}

function getMockDescription() {
  return "This is a mock description generated locally when the API is unavailable. In a production environment, this would be generated by an AI model analyzing the image.";
}

export const createReport = async (reportData) => {
  try {
    // Make a copy of the report data to avoid modifying the original
    const processedData = { ...reportData };

    // If we have a local file URI as the image and no uploadedImagePath
    if (processedData.image && processedData.image.startsWith('file://')) {
      console.log("Local file detected, uploading first:", processedData.image);

      try {
        // Upload the image first to get a server path
        const uploadedPath = await uploadImage(processedData.image);
        console.log("Image uploaded, got path:", uploadedPath);

        // Replace the local path with the server path
        processedData.image = uploadedPath;
      } catch (uploadError) {
        console.error("Failed to upload image, continuing with local path:", uploadError);
        // Continue with the local path - the server will handle it as a fallback
      }
    }

    console.log("Sending report data to server:", processedData);

    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(processedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create report response error:', errorText);
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Create report success:", result);

    // Ensure the image URL is properly formatted for frontend use
    if (result.report && result.report.image && !result.report.image.startsWith('http')) {
      result.report.image = getFullImageUrl(result.report.image);
    }

    return result;
  } catch (error) {
    console.error('Create report error:', error);

    // For demo purposes, if API fails, return mock success data
    return {
      success: true,
      report: {
        id: `mock-${Date.now()}`,
        ...reportData,
        status: "Pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updates: [{ date: new Date().toISOString(), text: "Report submitted" }]
      }
    };
  }
};
export const getUserReports = async () => {
  try {
    const response = await fetch(`${API_URL}/reports`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const reports = await response.json();
    console.log("Got user reports:", reports);

    // Fix image URLs in the reports
    return reports.map(report => {
      if (report.image && !report.image.startsWith('http')) {
        report.image = getFullImageUrl(report.image);
      }
      return report;
    });
  } catch (error) {
    console.error('Get user reports error:', error);

    // Return mock data for demo purposes
    return [
      {
        id: "mock1",
        title: "Pothole on Main Street",
        issueType: "Pothole",
        description: "Large pothole causing traffic issues",
        category: "Road Issue",
        image: "https://via.placeholder.com/150x100",
        location: "123 Main St",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        status: "Pending",
        updates: [{ date: new Date(Date.now() - 86400000 * 2).toISOString(), text: "Report submitted" }]
      },
      {
        id: "mock2",
        title: "Broken Streetlight",
        issueType: "Broken Streetlight",
        description: "Streetlight not working at night, creating safety concerns",
        category: "Streetlight",
        image: "https://via.placeholder.com/150x100",
        location: "456 Oak Ave",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        status: "In Progress",
        updates: [
          { date: new Date(Date.now() - 86400000 * 5).toISOString(), text: "Report submitted" },
          { date: new Date(Date.now() - 86400000 * 3).toISOString(), text: "Complaint reviewed by city officials" },
          { date: new Date(Date.now() - 86400000 * 1).toISOString(), text: "Maintenance team scheduled for repair" }
        ]
      }
    ];
  }
};

export const getReportById = async (reportId) => {
  try {
    if (!reportId) {
      console.error('No report ID provided');
      return null;
    }

    if (reportId.toString().startsWith('mock')) {
      console.log('Handling mock ID:', reportId);

      // For mock IDs, return mock data here
      // Find matching mock report
      const mockComplaints = [
        {
          id: "mock1",
          title: "Pothole on Main Street",
          issueType: "Pothole",
          description: "Large pothole causing traffic issues",
          category: "Road Issue",
          image: "https://via.placeholder.com/150x100",
          location: "123 Main St",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          status: "Pending",
          updates: [{ date: new Date(Date.now() - 86400000 * 2).toISOString(), text: "Report submitted" }]
        },
        {
          id: "mock2",
          title: "Broken Streetlight",
          issueType: "Broken Streetlight",
          description: "Streetlight not working at night, creating safety concerns",
          category: "Streetlight",
          image: "https://via.placeholder.com/150x100",
          location: "456 Oak Ave",
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          status: "In Progress",
          updates: [
            { date: new Date(Date.now() - 86400000 * 5).toISOString(), text: "Report submitted" },
            { date: new Date(Date.now() - 86400000 * 3).toISOString(), text: "Complaint reviewed by city officials" },
            { date: new Date(Date.now() - 86400000 * 1).toISOString(), text: "Maintenance team scheduled for repair" }
          ]
        },
        {
          id: "mock3",
          title: "Graffiti on Public Building",
          issueType: "Graffiti",
          description: "Unauthorized graffiti on city hall wall",
          category: "Vandalism",
          image: "https://via.placeholder.com/150x100",
          location: "City Hall",
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
          status: "Resolved",
          updates: [
            { date: new Date(Date.now() - 86400000 * 10).toISOString(), text: "Report submitted" },
            { date: new Date(Date.now() - 86400000 * 7).toISOString(), text: "Complaint reviewed by city officials" },
            { date: new Date(Date.now() - 86400000 * 5).toISOString(), text: "Cleaning crew dispatched" },
            { date: new Date(Date.now() - 86400000 * 3).toISOString(), text: "Graffiti removed, issue resolved" }
          ]
        }
      ];

      const mockReport = mockComplaints.find(report => report.id === reportId);
      return mockReport || null;
    }

    const response = await fetch(`${API_URL}/reports/${reportId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const report = await response.json();

    // Fix image URL if needed
    if (report.image && !report.image.startsWith('http')) {
      report.image = getFullImageUrl(report.image);
    }

    return report;
  } catch (error) {
    console.error('Get report error:', error);
    return null; // Return null instead of throwing error to avoid crashes
  }
};
export const updateReport = async (reportId, updateData) => {
  try {
    if (!reportId) {
      console.error('No report ID provided');
      return { success: false, message: 'No report ID provided' };
    }

    if (reportId.toString().startsWith('mock')) {
      console.log('Skipping API call for mock ID:', reportId);
      // Return mock success for demo
      return {
        success: true,
        data: {
          id: reportId,
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      };
    }

    const response = await fetch(`${API_URL}/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();

    // Fix image URL if needed
    if (result.report && result.report.image && !result.report.image.startsWith('http')) {
      result.report.image = getFullImageUrl(result.report.image);
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Update report error:', error);

    // Return mock success for demo instead of throwing error
    return {
      success: true,
      data: {
        id: reportId,
        ...updateData,
        updatedAt: new Date().toISOString()
      }
    };
  }
};
export const getCommunityFeed = async () => {
  try {
    const response = await fetch(`${API_URL}/reports/community/feed`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const reports = await response.json();

    // Fix image URLs in the reports
    return reports.map(report => {
      if (report.image && !report.image.startsWith('http')) {
        report.image = getFullImageUrl(report.image);
      }
      return report;
    });
  } catch (error) {
    console.error('Get community feed error:', error);

    // Return mock data
    return [
      {
        id: "mock1",
        title: "Pothole on Main Street",
        description: "Large pothole causing traffic issues",
        category: "Road Issue",
        image: "https://via.placeholder.com/300x200",
        location: "123 Main St",
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        status: "Pending",
        upvotes: 12,
        comments: 3,
        userId: {
          name: "Jane Doe",
          avatar: "https://via.placeholder.com/40",
        }
      },
      {
        id: "mock2",
        title: "Broken Streetlight",
        description: "Streetlight not working at night, creating safety concerns",
        category: "Streetlight",
        image: "https://via.placeholder.com/300x200",
        location: "456 Oak Ave",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: "In Progress",
        upvotes: 8,
        comments: 2,
        userId: {
          name: "John Smith",
          avatar: "https://via.placeholder.com/40",
        }
      }
    ];
  }
};

export const updateUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update user response error:', errorText);
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

// Export constants for use in other files
export { API_URL, API_BASE_URL, SENTIMENT_API_URL };