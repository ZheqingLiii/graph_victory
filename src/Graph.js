import React, { Component } from 'react';
import './Graph.css'
import {VictoryBar, VictoryChart, VictoryAxis, VictoryLine, VictoryGroup, VictoryLegend} from 'victory';

class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxLoad: 70,
      data: [],
      dataLoadStd: [],
      tickV: [],
      order: "desc",
      externalMutations: undefined,
      selectedData: []
    };
    this.sortByKeyAsc = this.sortByKeyAsc.bind(this);
    this.sortByKeyDesc = this.sortByKeyDesc.bind(this);
    this.removeMutation = this.removeMutation.bind(this);
    this.mergeData = this.mergeData.bind(this);
  }


  mergeClick() {
    this.setState({
      externalMutations: [
        {
          target: ["data"],
          eventKey: "all",
          mutation: () => ({ style: undefined }),
          callback: this.mergeData.bind(this)
        }
      ]
    });
  }

  mergeData(e) {
    //console.log(this.state.selectedData);
    if(this.state.selectedData.length >= 2) {
      var selData = this.state.selectedData;
      var sum = 0
      var tmpData = this.state.data;
      
      for (var i = 0; i < selData.length; i++) {
        sum += tmpData[selData[i]].load;
      }
      var avg = sum / selData.length;
      //console.log(sum, avg);
      for (var j = 0; j < selData.length; j++) {
        tmpData[selData[j]].load = avg;
      }
    
      if(this.state.order === "desc") {
        this.setState({data: this.sortByKeyDesc(tmpData, 'load')});
      } else {
        this.setState({data: this.sortByKeyAsc(tmpData, 'load')});
      }
    }
    this.setState({selectedData: []});
    this.setState({externalMutations: undefined});
  }

  removeMutation(){
    this.setState({selectedData: []});
    this.setState({externalMutations: undefined});
  }

  clearClicks() {
    this.setState({
      externalMutations: [
        {
          target: ["data"],
          eventKey: "all",
          mutation: () => ({ style: undefined }),
          callback: this.removeMutation.bind(this)
        }
      ]
    });
  }

  sortByKeyAsc(array, key){
    return array.sort(function(a, b) {
      var x = a[key];
      var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1: 0));
    });
  }
  sortByKeyDesc(array, key){
    return array.sort(function(a, b) {
      var x = a[key];
      var y = b[key];
      return ((x > y) ? -1 : ((x < y) ? 1: 0));
    });
  }


  componentDidUpdate(prevProp) {
    if (prevProp.info !== this.props.info) {
      var count = 0;
      var newData = []
      this.state.dataLoadStd.push({x:0, y:this.state.maxLoad});
      this.props.info.forEach(person => {
        if(person.length === 2){
          count +=1;
          const newPerson = {
            number: count,
            name: person[0],
            load: parseInt(person[1])
            //load: person[1]
          }
          const std = {
            x: count,
            y: this.state.maxLoad
          }
          newData.push(newPerson);
          this.state.dataLoadStd.push(std);
          this.state.tickV.push(count);
        }
      });
      //console.log(this.state.dataLoadStd);
      newData = this.sortByKeyDesc(newData, 'load');
      this.setState({data: newData});
    }
  }
   
    render() {
      return (
        
        <div>
          <h1>Loading Status</h1>
          <div className="graph" style={{ display: "flex", flexWrap: "wrap" }}>
          
          <VictoryChart domainPadding={30} width={750} height={400}>
            <VictoryLegend x={125} y={5} orientation="horizontal" gutter={18}
              symbolSpacer={10} itemsPerRow={5}
              data={[
              { name: "Overloaded", symbol: { fill: "tomato", fontSize:10, type: "triangleDown" } }, 
              { name: "Available", symbol: { fill: "green", fontSize:10, type: "triangleUp" } }, 
              //{ name: "Current", symbol: { fill: "navy", fontSize:10, type: "minus" } },
              { name: "Max", symbol: { fill: "#c43a31", type: "minus" } },
              { name: "High to Low", symbol: { fill: "black" }}
              ]}
              events={[{ target: "data", 
                eventHandlers: {onClick: () => {
                  return [{
                    target: "labels",
                    mutation: (props) => {
                      //console.log(props.text);
                      if(props.text === "High to Low") {
                        this.setState({order: "asc"});
                        this.setState({data: this.sortByKeyAsc(this.state.data, 'load')});
                      } else {
                        this.setState({order: "desc"});
                        this.setState({data: this.sortByKeyDesc(this.state.data, 'load')});
                      }
                      return props.text === "Low to High" ? null : {text: "Low to High"}
                    }
                  }]
                }}}]}
             />


            <VictoryAxis tickValues={this.state.tickV} tickFormat={this.state.data.name}
              style={{tickLabels: {fontSize: 10}}} />
            <VictoryAxis dependentAxis tickFormat={(x) => (`${x}%`)}
              style={{grid:{stroke:"A9A9A9"}}}/>
        
            <VictoryGroup offset={20}>
              <VictoryBar 
                externalEventMutations={this.state.externalMutations}
                events={[
                  {
                    target: "data",
                    eventHandlers: {
                      onClick: () => ({
                        target: "data",
                        mutation: (props) => {
                          this.state.selectedData.push(props.datum.group);
                          //console.log(this.state.selectedData);
                          return {
                            style: {fill: "orange"}
                      }}})
                  }}
                ]}
                style={{data: { fill: "A9A9A9" }, 
                  labels: { fill: (data) => data.load <= this.state.maxLoad? "green" : "tomato"}  }}
                alignment="start"
                labels={(data) => data.load}
                data={this.state.data} x="name" y="load"/>
              <VictoryLine 
                data={this.state.dataLoadStd}
                style={{data: { stroke: "#c43a31" },
                        parent: { border: "1px solid #ccc"}}} />
            </VictoryGroup>
            
          </VictoryChart>

          </div>
          <button className="Merge-buttom" onClick={this.clearClicks.bind(this)} >Reset</button>
          <button className="Merge-buttom" onClick={this.mergeClick.bind(this)} >Merge</button>
          
        </div>
      )
    }
  }
  export default Graph;