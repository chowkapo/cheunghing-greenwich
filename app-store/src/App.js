import React from 'react';
import { CircularProgress, TextField, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import logo from './logo.png';
import androidIcon from './images/device-android.png'
import iosIcon from './images/device-ios.png'
import md5 from 'md5'
import CryptoJS from 'crypto-js'
import './App.css';

const decryptWithAES = (ciphertext, passphrase) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

class App extends React.Component {
  constructor () {
    super()
    this._loadJson = this._loadJson.bind(this)
    this._handleClick = this._handleClick.bind(this)
    this._handleClose = this._handleClose.bind(this)
    this._handleConfirm = this._handleConfirm.bind(this)
    this.state = {
      currentYear: new Date().getFullYear(),
      json: null,
      error: null,
      open: false,
      url: null,
      accessCode: ''
    }
  }

  componentDidMount() {
    this._loadJson()
  }

  _loadJson() {
    const path = './app.json'
    fetch(path)
    .then((r) => r.json())
    .then(json  => {
      console.log(json)
      this.setState({
        json
      })
    })
    .catch(error => {
      this.setState({
        json: null,
        error: "Failed to load app details"
      })
    })
  }

  _handleClose() {
    this.setState({
      open: false,
      url: null,
      accessCode: ''
    })
  }

  _handleClick(url) {
    this.setState({
      open: true,
      accessCodeErrorText: '',
      accessCode: '',
      url
    })
  }

  _handleConfirm() {
    const url = this.state.url
    if (md5(this.state.accessCode) === this.state.json.accessCode) {
      this.setState({
        open: false
      }, () => window.open(decryptWithAES(url, this.state.accessCode), '_blank'))
    } else {
      this.setState({
        accessCodeErrorText: "Incorrect access code"
      })
    }

  }

  render() {
    const { currentYear, json, error, open, accessCode, accessCodeErrorText } = this.state
    console.log(json)
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className={open ? "App-logo" : "App-logo animated"} alt="Logo" />
          {error && <p>{error}</p>}
          {!json && !error && <CircularProgress style={{marginTop: 30}}/>}
          {json && !error && <React.Fragment>
            <div className="App-name">
              <img src={json.icon} alt='App icon' className='app-icon'/>
              <h1>{json.name}</h1>
              <h2 style={{marginLeft: 10}}>{json.version}</h2>
            </div>
            <div className="App-download-div">
              {json.ios && <button className="App-download" onClick={() => this._handleClick(json.ios.url)}>
                <img src={iosIcon} alt='iOS'/>
                <div className="App-info">
                  <span style={{fontWeight: 'bold', fontSize: 'x-large'}}>iOS</span>
                  <span style={{fontSize: 'xx-small'}}>{`Updated: ${json.ios.updated}`}</span>
                </div>
              </button>}
              {json.android && <button className="App-download" onClick={() => this._handleClick(json.android.url)}>
                <img src={androidIcon} alt='android' />
                <div className="App-info">
                  <span style={{fontWeight: 'bold', fontSize: 'x-large'}}>Android</span>
                  <span style={{fontSize: 'xx-small'}}>{`Updated: ${json.android.updated}`}</span>
                </div>
              </button>}
            </div>
          </React.Fragment>}
        </header>
        <footer className="footer">
          <a href="http://www.cheunghingelectronic.com/">Cheung Hing Electronic &amp; Electrical Engineering</a> @ {currentYear}
        </footer>
        <Dialog open={open} onClose={this._handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle>Access code required</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter pass code to access this app
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="accessCode"
              label="Access code"
              type="password"
              error={!!accessCodeErrorText}
              helperText={accessCodeErrorText}
              value={accessCode}
              fullWidth
              onChange={event => this.setState({
                accessCode: event.target.value,
                accessCodeErrorText: ''
              })}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  this._handleConfirm()
                  // evt.preventDefault()
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <IconButton color="primary" aria-label="cancel" onClick={this._handleClose}>
              <ClearIcon />
            </IconButton>
            <IconButton color="primary" aria-label="cancel" disabled={!accessCode} onClick={this._handleConfirm}>
              <CheckIcon />
            </IconButton>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

}
export default App;
