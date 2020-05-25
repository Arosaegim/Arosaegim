import React, { Component } from 'react';
import styled from 'styled-components';
import MapItem from './MapItem';

class MapView extends Component {

  componentDidMount() {
    console.log('mapview mounted')
  }

  componentDidUpdate() {
    console.log('mapview updated')
  }
  
  overlayItems = () => {
    const itemRefs = [];
    const items = this.props.items.map((el, index) => {
      const itemRef = React.createRef();
      const item = (
        <MapItem
          ref={itemRef}
          map={this.props.map}
          item={el}
          key={index}
          selectItem={this.selectItem}
        />
      );
      itemRefs.push(itemRef);
      return item;
    });
    this.itemRefs = itemRefs;
    return items;
  };

  selectItem = (item) => {
    this.props.selectItem(item)
  }

  render() {
    return (
      <>
        <MapViewContainer id="MapView" />
        {this.props.status === 'list' && this.overlayItems()}
      </>
    );
  }
}

export default MapView;

const MapViewContainer = styled.div`
  width: ${window.innerWidth}px;
  height: 300px;
`;