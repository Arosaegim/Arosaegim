/*global kakao*/
import React, { Component } from "react";
import styled from "styled-components";
import imgLeft from "../../../assets/balloon/balloon-left-filled@2x.png";
import imgMiddle from "../../../assets/balloon/balloon-middle-filled@2x.png";
import imgRight from "../../../assets/balloon/balloon-right-filled@2x.png";
import { Slide, Chip } from "@material-ui/core";
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import { getTimeDeltaString } from "../time/TimeFunctinon";

class MapItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      on: false,
    }
    this.myRef = React.createRef();
  }
  componentDidMount() {
    if (!this.state.on && !!this.props.map ) {
      // do something
      // this.showOnMap();
    }
  }

  componentDidUpdate() {
    if (!this.state.on && !!this.props.map ) {
      // do something
      // this.showOnMap();
    } 
  }

  componentWillUnmount() {
    // this.customOverlay.setMap(null);
  }

  // initial map overlay
  showOnMap = () => {
    const customOverlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(
        this.props.item.latitude,
        this.props.item.longitude
      ),
      content: this.myRef.current,
      yAnchor: 1,
      clickable: false,
    });
    customOverlay.setMap(this.props.map);
    this.customOverlay = customOverlay;
    this.setState({
      on: true,
    })
  };

  // deliver state item to parent
  clickEvent = (e) => {
    e.preventDefault();
    this.props.selectItem(this.props.item.id);
  };

  // show on map
  showItem = () => {
    this.customOverlay.setMap(this.props.map);
  };

  // hide from map
  hideItem = () => {
    this.customOverlay.setMap(null);
  };

  render() {
    return (
      <ItemContainer onClick={this.clickEvent}>
        <Chip color="primary" size="small" icon={<AccessTimeIcon />} label={this.props.item ? ' ' + getTimeDeltaString(this.props.item.regDate) : " "}/>
        <ItemLeft />
        <ItemMiddle>
          <TextMiddle>{this.props.item.contents.slice(0,5)}{this.props.item.contents.length > 5 ? '...' : ''}</TextMiddle>
        </ItemMiddle>
        <ItemRight />
      </ItemContainer>
    );
  }
}

export default MapItem;

const ItemContainer = styled.div`
  height: 30px;
  display: flex;
  margin-top: 15px;
  animation-duration: 1s;
  animation-name: slidein;
  @keyframes slidein {
    from {
      margin-left: 100%;
      width: 300%
    }
    to {
      margin-left: 0%;
      width: 100%;
    }
  }
`;

const ItemLeft = styled.div`
  height: 20px;
  width: 7px;
  background-image: url(${imgLeft});
  background-size: contain;
`;

const ItemMiddle = styled.div`
  height: 20px;
  width: auto;
  background-image: url(${imgMiddle});
  background-size: contain;
  padding-left: 4px;
  margin-right: -2px;
`;

const ItemRight = styled.div`
  height: 20px;
  width: 13px;
  background-image: url(${imgRight});
  background-size: contain;
`;

const TextMiddle = styled.div`
  position: relative;
  bottom: 16px;
  border: solid #20ad77 1px;
  border-radius: 2px;
  padding: 2px;
  color: #20ad77;
  background: rgba(255, 255, 255, 0.9);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
`;
