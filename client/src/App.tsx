// MINIMAL TEST - does React render at all?
export default function App() {
  return (
    <div style={{
      padding: 40,
      fontSize: 32,
      background: '#00ff00',
      color: '#000',
      position: 'fixed',
      top: 50,
      left: 0,
      right: 0,
      zIndex: 99998
    }}>
      REACT MOUNTED - {new Date().toISOString()}
    </div>
  );
}
