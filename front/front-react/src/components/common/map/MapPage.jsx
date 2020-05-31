/*global kakao*/
import React, { Component } from 'react';
import styled from 'styled-components';
import {IconButton, Zoom, Slide} from '@material-ui/core';
import {Map, Streetview} from '@material-ui/icons';
import {FlexColumn} from '../../../styles/DispFlex';
import DefaultButton from "../buttons/DefaultButton";

import {Storage} from '../../../storage/Storage';
import SearchBar from "../search/SearchBar";
import MapView from './MapView';
import MapListItem from "./MapListItem";
import RoadView from './RoadView';

import * as SA from '../../../apis/SaegimAPI';

class MapPage extends Component {
  constructor(props){
    super(props)
    this.state = {
      items: [],

      mv: null,

      rv: null,
      rvc: null,

      center: new kakao.maps.LatLng(37.50083104531534, 127.03694678811341),
      level: 3,
      userCenter: null,
      selected: {
        status: false,
        item: null,
      },
      bounds: null,

      roadView: false,
    }
  }

  setStateAsync(state) {
    return new Promise(resolve => {
      this.setState(state, resolve);
    });
  }

  async componentDidMount(){
    const _container = document.getElementById("mapView");
    const _options = {
      center: this.state.center,
      lever: this.state.level,
    }

    const _mapView = new kakao.maps.Map(_container, _options);
    kakao.maps.event.addListener(_mapView, "zoom_changed", this.changeLvCt)
    kakao.maps.event.addListener(_mapView, "center_changed", this.changeLvCt)
    // kakao.maps.event.addListener(_mapView, "dragstart", this.handleDragStart)
    // kakao.maps.event.addListener(_mapView, "bounds_changed", this.handleBoundsChange)

    await this.setStateAsync({ mv: _mapView })
    this.getMkrLi()

    await this.setStateAsync({bounds: _mapView.getBounds()})
    
    // get items from Backend with map center position
    const meter = SA.boundsToMeter({
      lat1: this.state.bounds.getSouthWest().getLat(),
      lon1: this.state.bounds.getSouthWest().getLng(),
      lat2: this.state.bounds.getNorthEast().getLat(),
      lon2: this.state.bounds.getNorthEast().getLng(),
    })

    let items = await SA.getSaegimNearMe({
      lat: this.state.center.getLat(),
      lng: this.state.center.getLng(),
      meter: meter
    })

    await this.setStateAsync({
      items: items
    })

    const _scale = _container.childNodes[1]
    _scale.style = `
      position: absolute; 
      z-index: 1; 
      margin: 0px 6px; 
      height: 19px; 
      line-height: 14px; 
      left: 0px; 
      bottom: 64px; 
      color: rgb(0, 0, 0);
    `
  }
  componentWillUnmount(){
    kakao.maps.event.removeListener(this.state.mv, "zoom_changed", this.changeLvCt)
    kakao.maps.event.removeListener(this.state.mv, "center_changed", this.changeLvCt)
    // kakao.maps.event.removeListener(this.state.mv, "dragstart", this.handleDragStart)
    // kakao.maps.event.removeListener(this.state.mv, "bounds_changed", this.handleBoundsChange)
  }

  getMkrLi = () => {
    dummyItems.forEach((el, idx) => {
      const mkr = new kakao.maps.Marker({
        position:  new kakao.maps.LatLng(el.latlng[0], el.latlng[1])
      });
      // console.log(this.state.mvView)
      mkr.setMap(this.state.mv)
    })
  }

  // handleDragStart = () => {
  //   this.setState({ mapCenter: this.state.mv.getCenter() });
  //   this.closeItem();
  // };

  // handleBoundsChange = () => {
  //   this.setState({ bounds: this.state.mv.getBounds() });
  //   // this.closeItem();
  // };

  // move directly to given center
  setCenter = (center) => {
    const targetCenter = new kakao.maps.LatLng(center.lat, center.lng);
    this.state.mv.setCenter(targetCenter);
  };

  // move smoothly to given center
  panTo = (center) => {
    const targetCenter = new kakao.maps.LatLng(center.lat, center.lng);
    this.state.mv.panTo(targetCenter);
  };

  selectItem = (item) => {
    // console.log(item);
    this.panTo({ lat: item.latitude, lng: item.longitude });
    this.setState({ selected: { status: true, item: item } });
  };

  closeItem = () => {
    this.setState({ selected: { status: false, item: null } });
  };

  prevItem = () => {
    const currentIndex = this.state.items.indexOf(this.state.selected.item);
    const prevIndex =
      currentIndex === 0 ? this.state.items.length - 1 : currentIndex - 1;
    this.selectItem(this.state.items[prevIndex]);
  };

  nextItem = () => {
    const currentIndex = this.state.items.indexOf(this.state.selected.item);
    const nextIndex =
      currentIndex === this.state.items.length - 1 ? 0 : currentIndex + 1;
    this.selectItem(this.state.items[nextIndex]);
  };

  // function for development
  addRndItemInView = () => {
    const bounds = this.state.mv.getBounds();
    const rndLat = this.generateRandom(bounds.ka, bounds.ja)
    const rndLng = this.generateRandom(bounds.da, bounds.ia)
  
    const lastItem = this.state.items[this.state.items.length - 1];
    const newItem = {
      id: lastItem? lastItem.id + 1 : 1,
      title: `new item ${lastItem ? lastItem.id + 1: 1}`,
      contents: "안녕하세요. 코로나때문에 사람들을 많이 못 보니 쓸쓸하기도 하고 기분이 다운되네요. 다들 어떠신가요?",
      image: null,
      latitude: rndLat,
      longitude: rndLng,
      record: null,
      regDate: 1590650953712,
      secret: 0,
      tags: [],
      userId: 2006,
      userName: "aaaa",
      w3w: "무릎.한글.튤립",
    };
    this.setState({
      items: this.state.items.concat(newItem),
    });
  };

  generateRandom = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  changeLvCt = () => {
    this.setState({
      center: this.state.mv.getCenter(),
      level: this.state.mv.getLevel(),
    })
  }

  tglView = async () => {
    await this.setStateAsync({ roadView: !this.state.roadView })

    if(this.state.roadView){
      const _cont = document.getElementById('roadView');
      const _rv = new kakao.maps.Roadview(_cont); //로드뷰 객체
      const _rvc = new kakao.maps.RoadviewClient(); //좌표로부터 로드뷰 파노ID를 가져올 로드뷰 helper객체
      var rvResultValue = {}
      const _pos = this.state.center

      // 특정 위치의 좌표와 가까운 로드뷰의 panoId를 추출하여 로드뷰를 띄운다.
      _rvc.getNearestPanoId(_pos, 50, (panoId) => {
        _rv.setPanoId(panoId, _pos); //panoId와 중심좌표를 통해 로드뷰 실행
        rvResultValue.panoId = panoId;
      });
      this.setState({ rv: _rv, rvc:_rvc }) 

      kakao.maps.event.addListener(_rv, 'init', () => {
        dummyItems.forEach((el, idx) => {
          const _mkr = new kakao.maps.Marker({
            position:  new kakao.maps.LatLng(el.latlng[0], el.latlng[1]),
            map: _rv
          });
          var projection = _rv.getProjection(); // viewpoint(화면좌표)값을 추출할 수 있는 projection 객체를 가져옵니다.
      
          // 마커의 position과 altitude값을 통해 viewpoint값(화면좌표)를 추출합니다.
          var viewpoint = projection.viewpointFromCoords(_mkr.getPosition(), _mkr.getAltitude());
          _rv.setViewpoint(viewpoint); //로드뷰에 뷰포인트를 설정합니다.
  
  
        })
      })
    }
  };

  changeIcon = () => {
    return (
      <>
        <Map style={{visibility: 'hidden'}}/>
        <Zoom in={this.state.roadView} style={{position: 'absolute', zIndex: 12,}}><Map/></Zoom>
        <Zoom in={!this.state.roadView} style={{position: 'absolute', zIndex: 13,}}><Streetview/></Zoom>
      </>
    )
  }

  render(){
    let _dir = 'left'
    if(this.context.curPage === '/write'){
      _dir = 'right'
    }

    return(
      <StMapCont height={this.context.appHeight}>

        <SearchBar on={!this.state.roadView}/>
        
        <Slide in={true} direction={_dir}>
        <StViewCont>
          
            <StBtnCont>
              <IconButton disableRipple onClick={this.tglView}>{this.changeIcon()}</IconButton>
            </StBtnCont>
            <ButtonWrapper>
              <DefaultButton
                text="add random item"
                onClick={this.addRndItemInView}
              />
            </ButtonWrapper>
            {this.state.selected.status && (
              <>
                <ButtonWrapper>
                  <DefaultButton text="prev Item" onClick={this.prevItem} />
                  <DefaultButton text="next Item" onClick={this.nextItem} />
                </ButtonWrapper>
                <MapListItem
                  item={this.state.selected.item}
                  closeItem={this.closeItem}
                />
              </>
            )}

          <MapView
            map={this.state.mv}
            status="list"
            items={this.state.items}
            selectItem={this.selectItem}
            hide={this.state.roadView}
          />

          <RoadView 
            rv={this.state.rv} 
            rvc={this.state.rvc} 
            data={dummyItems} 
            hide={!this.state.roadView}
          />

        </StViewCont>
        </Slide>
      </StMapCont>
    )
  }
} export default MapPage;
MapPage.contextType = Storage;


const StMapCont = styled(FlexColumn)`
  overflow: hidden;
  height: ${props => props.height}px;
  /* height: 100vh; */
`;

const StViewCont = styled.div`
  position: relative;

  width: 100%;
  height: 100%;
  background: gray;
`;

const StBtnCont = styled.div`
  position: absolute;
  z-index: 10;
  top: 64px;
  right: 8px;

  background: darkgray;
  border-radius: 50%;

`;

const ButtonWrapper = styled.div`
  position: absolute;
  z-index: 10;

  bottom: 72px;

  display: flex;
  padding: 0 16px 0 16px;
`;


const dummyItems = [
  {
    title: "카카오",
    latlng: [33.450705, 126.570677],
  },
  {
    title: "생태연못",
    latlng: [33.450936, 126.569477],
  },
  {
    title: "텃밭",
    latlng: [33.450879, 126.56994],
  },
  {
    title: "근린공원",
    latlng: [33.451393, 126.570738],
  },
  {
    title: "할리스",
    latlng: [37.50083104531534, 127.03694678811341],
  },
];

/*
data 양식

contents: "안녕하세요"
id: 2009
image: null
latitude: 37.50083104531534
longitude: 127.03694678811341
record: null
regDate: 1590650953712
secret: 0
tags: []
userId: 2006
userName: "aaaa"
w3w: "무릎.한글.튤립"
  
  */