import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  // Add a function to clear the error state and close the dialog
  handleClose = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      // Return a simple overlay dialog over your app content
      return (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <h3 style={styles.title}>An Error Occurred</h3>
            <p style={styles.message}>Something went wrong. Please try again or refresh the page.</p>
            <button style={styles.button} onClick={this.handleClose}>
              Dismiss
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple inline styles to create the dialog look
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  title: {
    margin: "0 0 12px 0",
    color: "#d32f2f",
  },
  message: {
    margin: "0 0 20px 0",
    color: "#555",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default ErrorBoundary;
