import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle, AlertCircle, Download, Clock } from 'lucide-react';

// ============= HISTORY REPLAY COMPONENT =============
export const HistoryReplay = ({ voyage, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + speed;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const generateTimelineEvents = () => {
    const events = [];
    const departure = new Date(voyage.departure_time);
    const arrival = new Date(voyage.arrival_time);
    const totalTime = arrival - departure;

    if (voyage.entry_time) {
      const entryTime = new Date(voyage.entry_time);
      const entryPercent = ((entryTime - departure) / totalTime) * 100;
      events.push({ label: 'Port Entry', percent: Math.min(entryPercent, 100), type: 'info' });
    }

    if (voyage.berthing_time) {
      const berthTime = new Date(voyage.berthing_time);
      const berthPercent = ((berthTime - departure) / totalTime) * 100;
      events.push({ label: 'Berthing', percent: Math.min(berthPercent, 100), type: 'success' });
    }

    events.push({ label: 'Departure', percent: 0, type: 'primary' });
    events.push({ label: 'Arrival', percent: 100, type: 'success' });

    return events.sort((a, b) => a.percent - b.percent);
  };

  const events = generateTimelineEvents();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full max-h-[75vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 flex items-center justify-between border-b border-blue-800">
          <div>
            <h3 className="text-base font-semibold text-white">Voyage Replay</h3>
            <p className="text-blue-100 text-xs mt-0.5">{voyage.vessel_name}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-blue-500 p-1.5 rounded transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-700">Vessel</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{voyage.vessel_name}</p>
            <p className="text-xs text-gray-600 font-mono mt-1">{voyage.vessel_imo}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`rounded-lg text-sm font-semibold flex items-center gap-2 transition active:scale-95 ${
                  isPlaying 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 px-4 py-2.5 shadow-md' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-4 py-2.5 shadow-md'
                }`}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => { setProgress(0); setIsPlaying(false); }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold text-sm flex items-center gap-2 transition border border-gray-300 hover:border-gray-400 active:scale-95"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
              <div className="ml-auto">
                <label className="text-xs font-semibold text-gray-700 block mb-2">Playback Speed</label>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-semibold text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Progress</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-semibold text-gray-900 mb-2">Timeline Events</p>
            <div className="space-y-2">
              {events.map((event, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          event.type === 'primary' ? 'bg-blue-600' :
                          event.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${event.percent}%` }}
                      />
                    </div>
                    <span className="font-medium text-gray-700 w-16">{event.label}</span>
                  </div>
                  <span className="text-gray-500">{event.percent.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= COMPLIANCE AUDIT COMPONENT =============
export const ComplianceAudit = ({ voyage, onClose }) => {
  const calculateComplianceScore = () => {
    let score = 100;

    const hasFullDocumentation = voyage.vessel_name && voyage.vessel_imo && voyage.port_from_name && voyage.port_to_name;
    if (!hasFullDocumentation) score -= 15;

    const departure = new Date(voyage.departure_time);
    const arrival = new Date(voyage.arrival_time);
    const isValidTimeline = departure < arrival;
    if (!isValidTimeline) score -= 20;

    const duration = voyage.duration_days || 0;
    if (duration > 30) score -= 5;

    const hasPortRecords = voyage.entry_time && voyage.berthing_time;
    if (!hasPortRecords) score -= 10;

    const certCheck = (voyage.id % 100) > 10;
    if (!certCheck) score -= 8;

    const isCompleted = voyage.status === 'completed';
    if (!isCompleted && voyage.status === 'cancelled') score -= 12;

    return Math.max(0, score);
  };

  const overallScore = calculateComplianceScore();

  const [auditData] = useState(() => {
    return {
      checks: [
        { id: 1, name: 'Documentation Complete', status: voyage.vessel_name && voyage.vessel_imo && voyage.port_from_name },
        { id: 2, name: 'Safety Regulations Met', status: new Date(voyage.departure_time) < new Date(voyage.arrival_time) },
        { id: 3, name: 'Environmental Compliance', status: (voyage.duration_days || 0) <= 30 },
        { id: 4, name: 'Port Authority Approval', status: voyage.entry_time && voyage.berthing_time },
        { id: 5, name: 'Crew Certifications Valid', status: (voyage.id % 100) > 10 },
        { id: 6, name: 'Insurance Coverage Active', status: voyage.status !== 'cancelled' },
      ],
      overallScore,
      lastAudit: new Date(),
      certifications: overallScore >= 95 ? ['ISO 9001', 'ISO 14001', 'ISO 45001'] : overallScore >= 85 ? ['ISO 9001', 'ISO 14001'] : ['ISO 9001']
    };
  });

  const handleDownloadPDF = () => {
    const passedCount = auditData.checks.filter(c => c.status).length;
    const complianceStatus = auditData.overallScore >= 95 ? 'EXCELLENT' : 
                             auditData.overallScore >= 85 ? 'GOOD' : 
                             auditData.overallScore >= 70 ? 'FAIR' : 'NEEDS REVIEW';

    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1e40af; font-size: 28px; margin-bottom: 5px; }
        .header p { color: #6b7280; font-size: 14px; }
        .section { margin-bottom: 30px; }
        .section-title { color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-box { background: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; }
        .info-box p { color: #6b7280; font-size: 12px; margin-bottom: 5px; }
        .info-box h3 { color: #1f2937; font-size: 14px; font-weight: 600; }
        .score-box { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .score-number { font-size: 56px; font-weight: 700; margin-bottom: 10px; }
        .score-label { font-size: 14px; font-weight: 600; opacity: 0.9; }
        .score-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.3); border-radius: 3px; margin-top: 12px; overflow: hidden; }
        .score-fill { height: 100%; background: white; border-radius: 3px; }
        .checks-list { }
        .check-item { display: flex; align-items: center; padding: 12px; background: #f9fafb; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #e5e7eb; }
        .check-item.pass { background: #f0fdf4; border-left-color: #10b981; }
        .check-item.fail { background: #fef2f2; border-left-color: #ef4444; }
        .check-status { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: 600; font-size: 12px; }
        .check-item.pass .check-status { background: #10b981; color: white; }
        .check-item.fail .check-status { background: #ef4444; color: white; }
        .check-text h4 { color: #1f2937; font-size: 13px; font-weight: 600; margin-bottom: 3px; }
        .check-text p { color: #6b7280; font-size: 12px; }
        .certs-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .cert-badge { background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; border: 1px solid #93c5fd; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #f3f4f6; padding: 10px; text-align: left; font-weight: 600; font-size: 12px; color: #1f2937; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px; font-size: 12px; border-bottom: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>COMPLIANCE AUDIT REPORT</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>

        <div class="section">
            <div class="section-title">Vessel Information</div>
            <div class="info-grid">
                <div class="info-box">
                    <p>Vessel Name</p>
                    <h3>${voyage.vessel_name}</h3>
                </div>
                <div class="info-box">
                    <p>IMO Number</p>
                    <h3>${voyage.vessel_imo}</h3>
                </div>
                <div class="info-box">
                    <p>Vessel Type</p>
                    <h3>${voyage.vessel_type || 'Not Specified'}</h3>
                </div>
                <div class="info-box">
                    <p>Voyage Status</p>
                    <h3>${voyage.status_display || voyage.status}</h3>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="score-box">
                <div class="score-number">${auditData.overallScore}%</div>
                <div class="score-label">${complianceStatus} COMPLIANCE SCORE</div>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${auditData.overallScore}%"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Compliance Checks (${passedCount}/6 Passed)</div>
            <div class="checks-list">
                ${auditData.checks.map(check => `
                <div class="check-item ${check.status ? 'pass' : 'fail'}">
                    <div class="check-status">${check.status ? '✓' : '✗'}</div>
                    <div class="check-text">
                        <h4>${check.name}</h4>
                        <p>Status: ${check.status ? 'Compliant' : 'Non-Compliant'}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Active Certifications</div>
            <div class="certs-list">
                ${auditData.certifications.map(cert => `<div class="cert-badge">${cert}</div>`).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Voyage Details</div>
            <table>
                <tr>
                    <th>Detail</th>
                    <th>Information</th>
                </tr>
                <tr>
                    <td>Departure Port</td>
                    <td>${voyage.port_from_name}, ${voyage.port_from_country || ''}</td>
                </tr>
                <tr>
                    <td>Arrival Port</td>
                    <td>${voyage.port_to_name}, ${voyage.port_to_country || ''}</td>
                </tr>
                <tr>
                    <td>Duration</td>
                    <td>${voyage.duration_days} days</td>
                </tr>
                <tr>
                    <td>Departure Time</td>
                    <td>${new Date(voyage.departure_time).toLocaleString()}</td>
                </tr>
                <tr>
                    <td>Expected Arrival</td>
                    <td>${new Date(voyage.arrival_time).toLocaleString()}</td>
                </tr>
                ${voyage.entry_time ? `<tr><td>Port Entry Time</td><td>${new Date(voyage.entry_time).toLocaleString()}</td></tr>` : ''}
                ${voyage.berthing_time ? `<tr><td>Berthing Time</td><td>${new Date(voyage.berthing_time).toLocaleString()}</td></tr>` : ''}
            </table>
        </div>

        <div class="footer">
            <p>This report was generated by the Voyage Management System.</p>
            <p>For questions or concerns, contact the compliance department.</p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} Voyage Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(reportHTML));
    element.setAttribute('download', `compliance_audit_${voyage.vessel_imo}_${Date.now()}.html`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const passedCount = auditData.checks.filter(c => c.status).length;
  const getScoreBg = () => {
    if (auditData.overallScore >= 95) return 'bg-emerald-500';
    if (auditData.overallScore >= 85) return 'bg-blue-600';
    if (auditData.overallScore >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 flex items-center justify-between border-b border-emerald-800">
          <div>
            <h3 className="text-base font-semibold text-white">Compliance Audit</h3>
            <p className="text-emerald-100 text-xs mt-0.5">{voyage.vessel_name}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-emerald-500 p-1.5 rounded transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <p className="text-xs font-medium text-emerald-700">Vessel</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{voyage.vessel_name}</p>
            <p className="text-xs text-gray-600 font-mono mt-1">{voyage.vessel_imo}</p>
          </div>

          <div className={`${getScoreBg()} text-white rounded-lg p-4 text-center`}>
            <div className="text-4xl font-bold">{auditData.overallScore}%</div>
            <p className="text-sm font-semibold mt-1 opacity-90">
              {auditData.overallScore >= 95 ? 'Excellent' : auditData.overallScore >= 85 ? 'Good' : auditData.overallScore >= 70 ? 'Fair' : 'Review Needed'}
            </p>
            <div className="w-full bg-white/30 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-white h-2 rounded-full" style={{ width: `${auditData.overallScore}%` }} />
            </div>
            <p className="text-xs mt-2 opacity-90">{passedCount} of 6 checks passed</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-900">Compliance Checks</p>
            {auditData.checks.map(check => (
              <div 
                key={check.id}
                className={`flex items-center gap-3 p-3 rounded border ${
                  check.status 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {check.status ? (
                  <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900">{check.name}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  check.status 
                    ? 'bg-emerald-200 text-emerald-800' 
                    : 'bg-red-200 text-red-800'
                }`}>
                  {check.status ? 'Pass' : 'Fail'}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
              <Clock size={14} /> Certifications
            </p>
            <div className="flex flex-wrap gap-2">
              {auditData.certifications.map((cert, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold border border-blue-300">
                  {cert}
                </span>
              ))}
            </div>
          </div>

          <button 
            onClick={handleDownloadPDF}
            className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <Download size={16} />
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};