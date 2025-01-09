# Social Media Blocker

A Chrome extension that helps you manage your social media usage by setting daily time limits and automatically removing distracting media content once those limits are reached.

## Features

- Set custom time limits for different social media websites
- Automatically removes images, videos, and other media content when time limit is reached
- Daily reset of time limits at a customizable time
- Simple popup interface for managing blocked sites
- Persistent storage of settings across browser sessions

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

### Adding Sites to Block

1. Click the extension icon in your Chrome toolbar
2. Enter the site URL (e.g., "reddit.com") in the "Site URL" field
3. Set the desired time limit in minutes
4. Click "Add Site" to save your settings

### Setting Reset Time

1. Open the extension popup
2. Scroll down to the "Reset Time" section
3. Choose your preferred reset time using the time picker
4. Click "Set Reset Time" to save

### How It Works

- The extension tracks your time spent on each blocked site
- Once you reach the time limit, the extension will:
  - Remove all images, videos, and iframes
  - Remove background images
  - Continue blocking new media content as it loads
- Time limits reset daily at your specified reset time (defaults to midnight)

