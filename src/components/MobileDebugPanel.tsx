import React from 'react';
// import { useOrderContext } from '../context/OrderContext_realtime';

// const MobileDebugPanel: React.FC = () => {
//     const { debugInfo, connectionStatus, isLoading, error, allOrders, menuItems, cashiers, forceRefresh } = useOrderContext();
//
//     // Only show on mobile devices or when there are connection issues
//     const shouldShow = debugInfo.isMobile || connectionStatus !== 'connected' || error;
//
//     if (!shouldShow) {
//         return null;
//     }
//
//     return (
//         <div style={{
//             position: 'fixed',
//             bottom: 0,
//             left: 0,
//             right: 0,
//             background: 'rgba(0, 0, 0, 0.9)',
//             color: 'white',
//             padding: '1rem',
//             fontSize: '0.8rem',
//             zIndex: 9999,
//             borderTop: '2px solid #f59e0b',
//             maxHeight: '40vh',
//             overflow: 'auto'
//         }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
//                 <h4 style={{ margin: 0, color: '#f59e0b' }}>📱 Mobile Debug Panel</h4>
//                 <button
//                     onClick={forceRefresh}
//                     style={{
//                         padding: '0.5rem 1rem',
//                         background: '#10b981',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         cursor: 'pointer',
//                         fontSize: '0.8rem'
//                     }}
//                     disabled={isLoading}
//                 >
//                     {isLoading ? '🔄 Loading...' : '🔄 Force Refresh'}
//                 </button>
//             </div>
//
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
//                 <div>
//                     <div style={{ fontWeight: 'bold', color: '#60a5fa', marginBottom: '0.5rem' }}>📊 Connection Status</div>
//                     <div>Status: <span style={{ color: connectionStatus === 'connected' ? '#10b981' : '#ef4444' }}>
//                         {connectionStatus === 'connected' ? '✅ Connected' : 
//                          connectionStatus === 'connecting' ? '🔄 Connecting...' : '❌ Disconnected'}
//                     </span></div>
//                     <div>Device: {debugInfo.isMobile ? '📱 Mobile' : '🖥️ Desktop'}</div>
//                     <div>Load Time: {debugInfo.dataLoadTime}ms</div>
//                     <div>Last Sync: {debugInfo.lastSync ? new Date(debugInfo.lastSync).toLocaleTimeString() : 'Never'}</div>
//                 </div>
//
//                 <div>
//                     <div style={{ fontWeight: 'bold', color: '#60a5fa', marginBottom: '0.5rem' }}>📋 Data Status</div>
//                     <div>Orders: {allOrders.length}</div>
//                     <div>Menu Items: {menuItems.length}</div>
//                     <div>Cashiers: {cashiers.length}</div>
//                     {error && <div style={{ color: '#ef4444', marginTop: '0.5rem' }}>Error: {error}</div>}
//                 </div>
//             </div>
//
//             <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#9ca3af' }}>
//                 <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>User Agent:</div>
//                 <div style={{ wordBreak: 'break-all' }}>{debugInfo.userAgent}</div>
//             </div>
//
//             {debugInfo.isMobile && (
//                 <div style={{ 
//                     marginTop: '1rem', 
//                     padding: '0.5rem', 
//                     background: 'rgba(245, 158, 11, 0.2)', 
//                     borderRadius: '4px',
//                     border: '1px solid #f59e0b'
//                 }}>
//                     <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>📱 Mobile Device Detected</div>
//                     <div style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
//                         If you're not seeing data, try:
//                         <br />• Clear browser cache completely
//                         <br />• Close and reopen the browser
//                         <br />• Check your internet connection
//                         <br />• Use the "Force Refresh" button above
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };
//
// export default MobileDebugPanel;

export {};
