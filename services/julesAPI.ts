
const JULES_API_BASE_URL = 'https://jules.googleapis.com/v1alpha';

const getApiKey = () => {
  const apiKey = process.env.JULES_API_KEY;
  if (!apiKey) {
    throw new Error('JULES_API_KEY is not set in the environment variables.');
  }
  return apiKey;
};

const makeApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const apiKey = getApiKey();
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    ...options.headers,
  });

  const response = await fetch(`${JULES_API_BASE_URL}/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
  }

  // Handle empty responses for methods like sendMessage
  if (response.headers.get('Content-Length') === '0' || response.status === 204) {
    return null;
  }

  return response.json();
};

export const julesAPI = {
  listSources: async () => {
    return makeApiRequest('sources');
  },

  createSession: async (prompt: string, source: string, startingBranch: string, title: string) => {
    const body = {
      prompt,
      sourceContext: {
        source,
        githubRepoContext: {
          startingBranch,
        },
      },
      automationMode: 'AUTO_CREATE_PR',
      title,
    };
    return makeApiRequest('sessions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  listActivities: async (sessionId: string) => {
    return makeApiRequest(`sessions/${sessionId}/activities?pageSize=30`);
  },

  sendMessage: async (sessionId: string, prompt: string) => {
    const body = {
      prompt,
    };
    return makeApiRequest(`sessions/${sessionId}:sendMessage`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
