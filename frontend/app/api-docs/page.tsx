'use client';

import { useState, useEffect } from 'react';

interface ApiEndpoint {
  path: string;
  method: string;
  summary: string;
  description: string;
  parameters?: Array<{
    name: string;
    in: string;
    description: string;
    required: boolean;
    schema: {
      type: string;
      default?: any;
      enum?: string[];
    };
  }>;
  responses: {
    [key: string]: {
      description: string;
    };
  };
}

export default function ApiDocs() {
  const [openApiSpec, setOpenApiSpec] = useState<any>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [testResponse, setTestResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/swagger.json')
      .then(res => res.json())
      .then(data => setOpenApiSpec(data))
      .catch(err => console.error('Failed to load API spec:', err));
  }, []);

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    setLoading(true);
    const params = new URLSearchParams();
    endpoint.parameters?.forEach(param => {
      if (param.in === 'query' && param.schema.default) {
        params.append(param.name, param.schema.default);
      }
    });

    try {
      const url = `${endpoint.path}${params.toString() ? '?' + params.toString() : ''}`;
      let fetchOptions: RequestInit = {
        method: endpoint.method
      };

      // For POST/PUT requests, add sample body data
      if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
        fetchOptions.headers = {
          'Content-Type': 'application/json'
        };
        
        // Generate sample data based on the endpoint
        let sampleBody = {};
        if (endpoint.path.includes('/charts')) {
          sampleBody = {
            title: 'Sample Chart',
            chartType: 'bar',
            numericValue: 'count',
            metric: 'revenue'
          };
          if (endpoint.method === 'PUT') {
            sampleBody = { ...sampleBody, id: '1' };
          }
        } else if (endpoint.path.includes('/metrics')) {
          sampleBody = {
            title: 'Sample Metric',
            value: '100',
            change: 5,
            changeType: 'positive'
          };
          if (endpoint.method === 'PUT') {
            sampleBody = { ...sampleBody, id: '1' };
          }
        } else if (endpoint.path.includes('/priorities')) {
          sampleBody = {
            title: 'Sample Priority',
            priority: 'high',
            impact: 'high',
            status: 'pending'
          };
          if (endpoint.method === 'PUT') {
            sampleBody = { ...sampleBody, id: '1' };
          }
        } else if (endpoint.path.includes('/recommendations')) {
          sampleBody = {
            text: 'Sample recommendation text',
            urgency: 'medium',
            impact: 'medium'
          };
          if (endpoint.method === 'PUT') {
            sampleBody = { ...sampleBody, id: '1' };
          }
        }
        
        fetchOptions.body = JSON.stringify(sampleBody);
      }

      // For DELETE requests, add id parameter if not already present
      if (endpoint.method === 'DELETE' && !params.has('id')) {
        params.append('id', '1');
        const deleteUrl = `${endpoint.path}?${params.toString()}`;
        fetchOptions = { method: 'DELETE' };
        const response = await fetch(deleteUrl, fetchOptions);
        const data = await response.json();
        setTestResponse(JSON.stringify(data, null, 2));
        return;
      }

      const response = await fetch(url, fetchOptions);
      const data = await response.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!openApiSpec) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  const endpoints: ApiEndpoint[] = Object.entries(openApiSpec.paths).flatMap(([path, methods]: [string, any]) =>
    Object.entries(methods).map(([method, details]: [string, any]) => ({
      path,
      method: method.toUpperCase(),
      ...details
    }))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{openApiSpec.info.title}</h1>
          <p className="text-lg text-gray-600 mb-4">{openApiSpec.info.description}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Version:</strong> {openApiSpec.info.version} | 
              <strong> Base URL:</strong> {openApiSpec.servers?.[0]?.url || 'http://localhost:3000'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">API Endpoints</h2>
            <div className="space-y-3">
              {endpoints.map((endpoint, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  className={`p-4 bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all duration-200 ${
                    selectedEndpoint === endpoint ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      endpoint.method === 'GET' ? 'bg-green-500' :
                      endpoint.method === 'POST' ? 'bg-blue-500' :
                      endpoint.method === 'PUT' ? 'bg-yellow-500' :
                      endpoint.method === 'DELETE' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="font-mono text-sm text-gray-800">{endpoint.path}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{endpoint.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedEndpoint ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      selectedEndpoint.method === 'GET' ? 'bg-green-500' :
                      selectedEndpoint.method === 'POST' ? 'bg-blue-500' :
                      selectedEndpoint.method === 'PUT' ? 'bg-yellow-500' :
                      selectedEndpoint.method === 'DELETE' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}>
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-lg">{selectedEndpoint.path}</span>
                  </div>
                  <h2 className="text-xl font-semibold mt-2 text-gray-900">{selectedEndpoint.summary}</h2>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedEndpoint.description}</p>
                  </div>

                  {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">Parameters</h3>
                      <div className="space-y-3">
                        {selectedEndpoint.parameters.map((param, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-semibold text-gray-900">{param.name}</span>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{param.in}</span>
                              {param.required && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">required</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{param.description}</p>
                            <div className="text-xs text-gray-500">
                              <span className="font-semibold">Type:</span> {param.schema.type}
                              {param.schema.default && (
                                <span className="ml-2"><span className="font-semibold">Default:</span> {param.schema.default}</span>
                              )}
                              {param.schema.enum && (
                                <span className="ml-2"><span className="font-semibold">Options:</span> {param.schema.enum.join(', ')}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Responses</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedEndpoint.responses).map(([code, response]: [string, any]) => (
                        <div key={code} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                          <span className={`px-3 py-1 rounded font-mono text-sm font-semibold ${
                            code.startsWith('2') ? 'bg-green-100 text-green-800' :
                            code.startsWith('4') ? 'bg-yellow-100 text-yellow-800' :
                            code.startsWith('5') ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {code}
                          </span>
                          <span className="text-gray-700">{response.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Try it out</h3>
                    <button
                      onClick={() => testEndpoint(selectedEndpoint)}
                      disabled={loading}
                      className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed font-semibold"
                    >
                      {loading ? 'Testing...' : 'Send Request'}
                    </button>

                    {testResponse && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2 text-gray-900">Response</h4>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          {testResponse}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an endpoint</h3>
                <p className="text-gray-600">Choose an API endpoint from the list to view its documentation and test it.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}