/* global kakao */
import React, { Component } from "react";
import styled from "styled-components";
import MapItem from "./MapItem";
import * as MM from "./MapMethod";
import MapListItem from "./MapListItem";
import DefaultButton from "../buttons/DefaultButton";

// import MapMarker, {MarkerConfig} from "./MapItemTest";

class MapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: this.props.items,
      mv: null,
      mapProjection: null,
      userMarker: null,
      clusterer: null,
      selectedList: {
        status: false,
        items: [],
      },
      selected: {
        status: false,
        item: null,
      },
    };
    this.markers = []
  }

  setStateAsync(state) { return new Promise(resolve => { this.setState(state, resolve) }) }

  async componentDidMount() {
    await this.initMapView();
    await this.fetchItem();
    this.overlayMarkers();
  }
  
  componentDidUpdate(prevProps, prevState) {
    if(prevProps.items !== this.props.items) {
      // console.log('re-rendering markers')
      this.overlayMarkers();
    }
    if(prevProps.mapCenter !== this.props.mapCenter && this.props.mapCenter === this.props.userCenter){
      this.state.mv.panTo(this.props.mapCenter);
      // this.state.userMarker.setPosition(this.props.userCenter)
    }
    // (!!this.props.userCenter && this.props.usingUserCenter && !this.state.userMarker && this.showUserCenter())
    // if (prevProps.usingUserCenter !== this.props.usingUserCenter){console.log(prevProps, this.props, this.state)}
    // if (prevProps.usingUserCenter !== this.props.usingUserCenter && this.props.usingUserCenter && !!this.state.userMarker) {
    //   
    //   this.state.mv.panTo(this.props.userCenter)
    //   // MM.panTo(this.state.mv, this.props.userCenter.getLat(), this.props.userCenter.getLng())
    // }

  }

  componentWillUnmount(){
    kakao.maps.event.removeListener(this.state.mv, "zoom_changed", this.changeLvCt)
    kakao.maps.event.removeListener(this.state.mv, "center_changed", this.changeLvCt)
    kakao.maps.event.removeListener(this.state.mv, "dragstart", this.handleDragStart)
    kakao.maps.event.removeListener(this.state.mv, "dragend", this.handleDragEnd)
  }

  // 지도 초기화
  initMapView = () => {
    const _cont = document.getElementById('mapView');
    const _options = {
      center: this.props.mapCenter,
      level: 3,
    }
    const _mapView = new kakao.maps.Map(_cont, _options)
    kakao.maps.event.addListener(_mapView, "zoom_changed", this.changeLvCt)
    kakao.maps.event.addListener(_mapView, "center_changed", this.changeLvCt)
    kakao.maps.event.addListener(_mapView, "dragstart", this.handleDragStart)
    kakao.maps.event.addListener(_mapView, "dragend", this.handleDragEnd)

    const _mapProjection = _mapView.getProjection()

    const _clusterer = new kakao.maps.MarkerClusterer({
      map: _mapView, // 마커들을 클러스터로 관리하고 표시할 지도 객체 
      averageCenter: true, // 클러스터에 포함된 마커들의 평균 위치를 클러스터 마커 위치로 설정 
      minLevel: 1, // 클러스터 할 최소 지도 레벨 
      disableClickZoom: true // 클러스터 마커를 클릭했을 때 지도가 확대되지 않도록 설정한다
    });

    kakao.maps.event.addListener(_clusterer, 'clusterclick', this.handleCluster);

    this.setState({
      mv: _mapView,
      mapProjection: _mapProjection,
      clusterer: _clusterer,
    })
  }

  changeLvCt = () => {
    // this.props.changeMapCenter(this.state.mv.getCenter())
    // this.setState({
    //   mapCenter: this.state.mv.getCenter(),
    //   level: this.state.mv.getLevel(),
    // })
  }

  fetchItem = () => {
    const bounds = this.state.mv.getBounds();
    const center = this.state.mv.getCenter();
    this.props.fetchItem(bounds, center);
  }

  showUserCenter = () => {
    const userCenterPos = {
      latitude: this.props.userCenter.getLat(),
      longitude: this.props.userCenter.getLng()
    }
    MM.panTo(this.state.mv, userCenterPos.latitude, userCenterPos.longitude)
    const markerConfig = MM.MarkerConfig(userCenterPos, "user")
    const userMarker = new kakao.maps.Marker(markerConfig);
    userMarker.setMap(this.state.mv)
    this.setState({userMarker: userMarker})
  }

  handleDragStart = () => {
    // (this.state.selected.status && this.closeItem());
    (this.props.usingUserCenter && this.props.unsetUsingUserCenter());
    (this.state.selectedList.status && this.unsetSelectedList());
    (this.props.unsetAll())
  };

  handleDragEnd = () => {
    this.props.changeMapCenter(this.state.mv.getCenter())
    this.fetchItem();
    // (this.state.selected.status && this.closeItem());
    // (this.state.usingUserCenter && this.setState({usingUserCenter: false}));
  };

  handleCluster = (cluster) => {
    const items = cluster.getMarkers()
    const selectedList = {
      status: true,
      items: items.map(marker=>{
        const item = this.props.items.find(el => marker.itemId === el.id);
        return item === undefined ? emptyItem : item
      })
    }
    this.setState({selectedList: selectedList})

    // set panTo offset : show cluseter on slightly left of screen
    const CENTER_OFFSET_RATIO = 0.2; // percentage
    const width = window.innerWidth;
    const center_offset = Math.floor(width * CENTER_OFFSET_RATIO);

    const cluster_point = this.state.mapProjection.pointFromCoords(cluster.getCenter())
    const target_point = new kakao.maps.Point(cluster_point.x + center_offset, cluster_point.y);

    const target_coords = this.state.mapProjection.coordsFromPoint(target_point);

    this.state.mv.panTo(target_coords);
  }

  overlayMarkers = async () => {
    // await this.markers.forEach(el=>el.setMap(null));
    const markers = this.props.items.map((el) => {
      const marker = new kakao.maps.Marker(MM.MarkerConfig(el));// new MapMarker(el);
      marker.setMap(this.state.mv)
      marker.itemId = el.id
      kakao.maps.event.addListener(marker, "click", () => {
        console.log(marker.itemId,'marker clicked');
        this.selectItem(marker.itemId)
      })
      return marker
    })
    this.markers = markers;
    this.state.clusterer.clear();
    this.state.clusterer.addMarkers(markers);
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
          key={el.id}
          selectItem={this.selectItem}
        />
      );
      itemRefs.push(itemRef);
      return item;
    });
    this.itemRefs = itemRefs;
    this.items = items;
    return items
  };

  selectItem = (itemId) => {
    // this.props.selectItem(item);
    const item = this.props.items.find(el => itemId === el.id)
    if (item === undefined) {
      return;
    }
    this.setState({selected: { status: true, item: item }})
    this.props.unsetUsingUserCenter();
    MM.panTo(this.state.mv, item.latitude, item.longitude)
  };

  closeItem = () => {
    this.setState({selected: { status: false, item: null }})
  }

  prevItem = () => {
    const currentIndex = this.state.selectedList.items.indexOf(this.state.selected.item);
    const prevIndex =
      currentIndex === 0 ? this.state.selectedList.items.length - 1 : currentIndex - 1;
    this.selectItem(this.state.selectedList.items[prevIndex].id);
  };

  nextItem = () => {
    const currentIndex = this.state.selectedList.items.indexOf(this.state.selected.item);
    const nextIndex =
      currentIndex === this.state.selectedList.items.length - 1 ? 0 : currentIndex + 1;
    this.selectItem(this.state.selectedList.items[nextIndex].id);
  };


  overlaySelectedList = () => {
    return this.state.selectedList.items.map(el=> <MapItem key={el.id} item={el} selectItem={this.selectItem} />)
  }

  unsetSelectedList = () => {
    this.setState({selectedList: {status: false, items: []}})
  }

  render() {
    return (
      <>
        <StView id="mapView" hidden={this.props.hide}>
        {/* {this.props.status === 'list' && this.overlayItems()} */}
          {/* <>{this.props.status === 'list' && this.props.items.map((el, index) => {
            return <MapItem
            map={this.props.map}
            item={el}
            key={index}
            selectItem={this.selectItem}
          />})}</> */}
        </StView>
        {this.state.selectedList.status && 
          <StListCont>
            <StList>
              {this.overlaySelectedList()}
            </StList>
          </StListCont>
        }
        {this.state.selected.status && 
          <>
            {this.state.selectedList.status &&
              <ButtonWrapper>
                <DefaultButton text="prev Item" onClick={this.prevItem} />
                <DefaultButton text="next Item" onClick={this.nextItem} />
              </ButtonWrapper>
            } 
            <MapListItem
              item={this.state.selected.item}
              closeItem={this.closeItem}
            />
          </>
        }
      </>
    );
  }
}
export default MapView;

const StView = styled.div`
  width: 100%;
  height: 100%;
`;

const StListCont = styled.div`
  position: absolute;
  width: auto;
  height: auto;
  overflow-y: auto;
  max-height: 50%;
  max-width: 60%;
  z-index: 15;
  top: 50%;
  right: 0px;
  padding-right: 8px;
  padding-top: 16px;
  padding-bottom: 16px;
  transform: translateY(-50%);
  /* background: linear-gradient(0.25turn, rgba(255,255,255,0) 80%, #838e83 ); */
`

const StList = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
`

const ButtonWrapper = styled.div`
  position: absolute;
  z-index: 10;
  bottom: 72px;

  display: flex;
  padding: 0 16px 0 16px;
`;

const emptyItem = {
  contents: "emptyItem",
  id: 0,
  image: null,
  latitude: 37.50083104531534,
  longitude: 127.03694678811341,
  record: null,
  regDate: 1590650953712,
  secret: 0,
  tags: [],
  userId: 0,
  userName: "empty",
  w3w: "empty"
}