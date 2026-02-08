"""
Dino Run - A web-based learning game
This Flask app serves the Dino Run game to your browser
"""

from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route('/')
def index():
    """Serve the main game page"""
    return render_template('index.html')

if __name__ == '__main__':
    # Run the server on localhost:8080
    print("=" * 50)
    print("Dino Run is starting!")
    print("=" * 50)
    print("Open your browser to: http://localhost:8080")
    print("=" * 50)
    app.run(host='0.0.0.0', port=8080, debug=True)
