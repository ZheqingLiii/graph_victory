import React, { Component } from 'react';
import CSVReader from 'react-csv-reader'

class ReadFile extends Component {
    constructor() {
        super();
        this.state = {};
    }

  handleForce = files => {
    this.props.onGetInfo(files);
  }
    render() {
      return (
        <CSVReader
          cssClass="csv-reader-input"
          onFileLoaded={this.handleForce}
          onError={this.handleDarkSideForce}
          inputId="ObiWan"
          inputStyle={{color: 'red'}}
          />
      )
    }
  }
  export default ReadFile;