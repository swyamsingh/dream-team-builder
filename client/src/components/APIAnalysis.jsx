import React, { useState, useEffect } from 'react'
import { Code, Database, Globe, Copy, CheckCircle } from 'lucide-react'
import { getAPIAnalysis } from '../services/torreAPI'

const APIAnalysis = () => {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedSection, setCopiedSection] = useState('')

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await getAPIAnalysis()
        setAnalysis(data)
      } catch (error) {
        console.error('Failed to fetch API analysis:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [])

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(''), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  if (loading) {
    return (
      <section className="api-analysis">
        <div className="analysis-header">
          <Code className="analysis-icon" />
          <h2>Torre API Analysis</h2>
          <p>Loading reverse engineering results...</p>
        </div>
      </section>
    )
  }

  if (!analysis) {
    return (
      <section className="api-analysis">
        <div className="analysis-header">
          <Code className="analysis-icon" />
          <h2>Torre API Analysis</h2>
          <p>Failed to load API analysis</p>
        </div>
      </section>
    )
  }

  return (
    <section className="api-analysis">
      <div className="analysis-header">
        <Code className="analysis-icon" />
        <h2>Torre API Reverse Engineering Results</h2>
        <p>Comprehensive analysis of Torre's API endpoints, request/response formats, and implementation details</p>
        <div className="analysis-meta">
          <Database className="meta-icon" />
          <span>Generated: {new Date(analysis.timestamp).toLocaleString()}</span>
        </div>
      </div>

      <div className="endpoints-section">
        <h3>API Endpoints Analyzed</h3>
        
        {analysis.endpoints.map((endpoint, index) => (
          <div key={index} className="endpoint-card">
            <div className="endpoint-header">
              <div className="endpoint-method">{endpoint.method}</div>
              <div className="endpoint-url">
                <Globe className="url-icon" />
                <span>{endpoint.url}</span>
                <button
                  onClick={() => copyToClipboard(endpoint.url, `url-${index}`)}
                  className="copy-button"
                  title="Copy URL"
                >
                  {copiedSection === `url-${index}` ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            
            <p className="endpoint-description">{endpoint.description}</p>

            <div className="endpoint-details">
              <div className="detail-section">
                <h4>Request Format</h4>
                <div className="code-block">
                  <div className="code-header">
                    <span>JSON</span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(endpoint.requestFormat, null, 2), `request-${index}`)}
                      className="copy-button"
                    >
                      {copiedSection === `request-${index}` ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <pre><code>{JSON.stringify(endpoint.requestFormat, null, 2)}</code></pre>
                </div>
              </div>

              <div className="detail-section">
                <h4>Response Format</h4>
                <div className="response-info">
                  <p><strong>Type:</strong> {endpoint.responseFormat.type}</p>
                  <p><strong>Structure:</strong> {endpoint.responseFormat.structure}</p>
                </div>
                <div className="code-block">
                  <div className="code-header">
                    <span>JSON Schema</span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(endpoint.responseFormat.fields, null, 2), `response-${index}`)}
                      className="copy-button"
                    >
                      {copiedSection === `response-${index}` ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <pre><code>{JSON.stringify(endpoint.responseFormat.fields, null, 2)}</code></pre>
                </div>
              </div>

              <div className="detail-section">
                <h4>Required Headers</h4>
                <div className="headers-list">
                  {Object.entries(endpoint.headers).map(([header, value]) => (
                    <div key={header} className="header-item">
                      <span className="header-name">{header}:</span>
                      <span className="header-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {endpoint.exampleRequest && (
                <div className="detail-section">
                  <h4>Example Request</h4>
                  <div className="code-block">
                    <div className="code-header">
                      <span>JSON</span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(endpoint.exampleRequest, null, 2), `example-${index}`)}
                        className="copy-button"
                      >
                        {copiedSection === `example-${index}` ? <CheckCircle size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <pre><code>{JSON.stringify(endpoint.exampleRequest, null, 2)}</code></pre>
                  </div>
                </div>
              )}

              {endpoint.exampleResponse && (
                <div className="detail-section">
                  <h4>Example Response</h4>
                  <div className="code-block">
                    <div className="code-header">
                      <span>JSON</span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(endpoint.exampleResponse, null, 2), `example-response-${index}`)}
                        className="copy-button"
                      >
                        {copiedSection === `example-response-${index}` ? <CheckCircle size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <pre><code>{JSON.stringify(endpoint.exampleResponse, null, 2)}</code></pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="analysis-notes-section">
        <h3>Analysis Notes</h3>
        <div className="notes-list">
          {analysis.analysisNotes.map((note, index) => (
            <div key={index} className="note-item">
              <span className="note-bullet">•</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="security-section">
        <h3>Security Considerations</h3>
        <div className="security-list">
          {analysis.securityConsiderations.map((consideration, index) => (
            <div key={index} className="security-item">
              <span className="security-bullet">🔒</span>
              <span>{consideration}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="implementation-notes">
        <h3>Implementation Notes for Dream Team Builder</h3>
        <div className="implementation-details">
          <p>This analysis was conducted by reverse-engineering Torre's API through network inspection and testing. The Dream Team Builder application implements these endpoints with proper error handling, rate limiting considerations, and user-friendly interfaces.</p>
          
          <div className="features-implemented">
            <h4>Features Implemented:</h4>
            <ul>
              <li>Real-time people search with streaming API support</li>
              <li>Comprehensive user profile analysis</li>
              <li>Team building and skill gap analysis</li>
              <li>Responsive UI with modern React components</li>
              <li>Error handling and loading states</li>
              <li>API documentation and reverse engineering results</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default APIAnalysis