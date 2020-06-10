import React, {Component} from "react";
import styled from "styled-components";
import { Zoom, Avatar, Modal, MobileStepper, Button } from "@material-ui/core";
import { ArrowBack, Lock, AccessTime, ArrowBackIos, ArrowForwardIos, Photo, Close  } from "@material-ui/icons";
import Card from "../cards/Card";
import * as SA from "../../../apis/SaegimAPI"
import { getUserByID } from "../../../apis/UserAPI"
import { getTimeDeltaString } from "../time/TimeFunctinon";
import Chip from "../chip/Chip"
import SaegimDetailButton from "../../saegim/SaegimDetailButton";
import Comment from "../../saegim/Comment";
import Like from "../../saegim/Like";
import {Storage} from "../../../storage/Storage";
import { FlexRow, FlexColumn } from "../../../styles/DispFlex";
import Loading from "../background/Loading";
import PinIcon from "../../../assets/PinIcon";

class RoadViewSaegimDetail extends Component {
  isLoading = true;

  constructor(props) {
    super(props);
    this.state = {
      data: {
        tags: [],
        images: []
      },
      regDate: "",
      userId: "",
      updateFlagByLike: false,
      curImage: -1,
      open: false,
      activeStep: 0,
      maxSteps: 0,
      detailColor: "linear-gradient(#FBF2EE,#ffffff38),linear-gradient(-45deg,#f3b3a6,#ffffff00),linear-gradient(45deg,#ff6b6b,#ffffff40)",
      user: {},
      isUser: 0,
      isLoading: true
    };
    this.goBack = this.goBack.bind(this);
    this.setUpdateLike = this.setUpdateLike.bind(this);
    this.setOpen = this.setOpen.bind(this);
    this.setActiveStep = this.setActiveStep.bind(this);
  }

  goBack() {
    this.props.tgleDetail()
  }

  setOpen(status) {
    this.setState({
      open: status
    })
  }

  handleOpen = () => {
    this.setOpen(true)
  }

  handleClose = () => {
    this.setOpen(false)
  }

  setActiveStep(step) {
    this.setState({
      activeStep: step
    })
  }

  handleNext = () => {
    this.setActiveStep(this.state.activeStep + 1)
  }

  handleBack = () => {
    this.setActiveStep(this.state.activeStep - 1)
  }

  getSaegimDetail = async () => {
    const _user = await getUserByID(this.state.data.userId)
    await this.setStateAsync({ 
      data: this.props.sgDetail,      
      user: _user 
    })
  }

  getRegDate = () => {
    if (this.state.data.regDate !== undefined) {
      const _regDate = getTimeDeltaString(this.state.data.regDate)
      this.setState({regDate: _regDate})
    }
  }

  setIsUser = () => {
    if (this.state.data.secret) {
      if (this.state.userId === this.state.data.userId) {
        this.setStateAsync({
          isUser: 2
        })
      } else {
        this.setState({
          isUser: 1
        })
      }
    }
  }

   switchImage = () => {
    if (this.state.curImage < this.state.data.files.length - 1) {
      this.setState({
        curImage: this.state.curImage + 1
      });
    } else {
      this.setState({
        curImage: 0
      });
    }
    return this.state.curImage;
  }

  async componentDidMount() {
    const _userInfo = this.context.userInfo
    if (_userInfo !== {}) {
      this.setState({
        userId: _userInfo.id
      })
    }
    await this.getSaegimDetail()
    this.setStateAsync({
      maxSteps: this.state.data.files.length
    })
    await this.setIsUser()
    await this.getRegDate()

    this.isLoading = false
    this.startTimer = setTimeout(this.setState({
      curImage: this.state.curImage + 1
    }), 5000)
  }
  componentWillUnmount() {
    clearTimeout(this.startTimer)
  }

  setUpdateLike(flag) {
    this.setState({
      updateFlagByLike: flag
    })
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  newLineContent = (contents) => {
    return contents.split('\n').map((el, index)=>{
      return <span key={index}>{el}<br/></span>
    })
  }

  render() {
    if (this.isLoading === true) {
      return <Loading/>
    } else {
      const PrintChip = this.state.data.tags.map((tag) => {
        return (
          <StChip text={tag.name} key={tag.id}/>
        )
      })
      return (
        <Zoom in={this.props.on} mountOnEnter unmountOnExit>
          <Wrapper>
            {/* {this.state.data.images.length > 0 && */}
            {this.state.data.files.length > 0 &&
            <Modal
              open={this.state.open}
            >
              <>
                <ImageWrapper>
                  <StClose onClick={this.handleClose}>
                    <Close/>
                  </StClose>
                  <StImg
                    // src={this.state.data.images[this.state.activeStep].source}
                    // alt={this.state.data.images[this.state.activeStep]}
                    src={this.state.data.files[this.state.activeStep].url}
                    alt={this.state.data.files[this.state.activeStep]}
                  />
                  <StMobileStepper
                    steps={this.state.maxSteps}
                    position="static"
                    variant="dots"
                    activeStep={this.state.activeStep}
                    nextButton={
                      <Button
                        onClick={this.handleNext}
                        disabled={this.state.activeStep === this.state.maxSteps - 1}
                      >
                        <ArrowForwardIos/>
                      </Button>
                    }
                    backButton={
                      <Button
                        onClick={this.handleBack}
                        disabled={this.state.activeStep === 0}
                      >
                        <ArrowBackIos/>
                      </Button>
                    }
                  />
                </ImageWrapper>
              </>
            </Modal>
            }
            <TopBar>
              <StTopBarR>
              <BackButton onClick={this.goBack}>
                <ArrowBack/>
              </BackButton>
              {this.state.userId === this.state.data.userId &&
                <SaegimDetailButton id={this.props.id}/>
              }
              </StTopBarR>
              <StCont>
                <StNick>{this.state.user.name}</StNick>
                <Avatar src={this.state.user.profileImage}/>
              </StCont>
            </TopBar>
            <Contents>
              {/* {(this.state.data.images.length > 0 && this.state.isUser !== 1)
              && <BackGround bgImage={this.state.data.images[this.state.curImage].source}/>
              } */}
              {(this.state.data.files.length > 0 && this.state.isUser !== 1)
              && <BackGround bgImage={this.state.data.files[this.state.curImage].url}/>
              }
              <W3WChip>
                <Chip
                  size="medium"
                  text={this.state.data.w3w}
                  icon={<PinIcon />}
                />
              </W3WChip>
              <CardWrapper>
                <Card color={this.state.detailColor}>
                  <StCard>
                    {this.state.isUser !== 1
                      ? this.newLineContent(this.state.data.contents)
                      : <p>{"비밀글입니다."}<br/>{"작성자만 볼 수 있습니다."}</p>}
                  </StCard>
                </Card>
              </CardWrapper>
              <ContentsBot>
                <LockIcon>
                  {this.state.data.secret ? <Lock/> : <Lock style={{display: 'none'}}/>}
                </LockIcon>
                {/* {this.state.data.images.length > 0 */}
                {this.state.data.files.length > 0
                  ?
                  <Image>
                    <StPhotoIcon onClick={this.handleOpen}/>
                    {/* <div>{this.state.data.images.length}</div> */}
                    <div>{this.state.data.files.length}</div>
                  </Image>
                  : <Image style={{display: 'none'}}>
                    <StPhotoIcon/>
                  </Image>
                }
              </ContentsBot>
            </Contents>
            <Communication>
              <BotWrapper>
                <Registered>
                  <StAccessTime/>
                  {this.state.regDate}
                </Registered>
                <Likes>
                  <div>
                    <Like
                      setUpdateLike={this.setUpdateLike}
                      id={this.props.id}
                      likes={this.state.data.likes}/>
                  </div>
                </Likes>
              </BotWrapper>
              <Tags>
                {PrintChip}
              </Tags>
              <Comments>
                <Comment id={this.props.id}/>
              </Comments>
            </Communication>
          </Wrapper>
        </Zoom>
      )
    }
  }
}

export default RoadViewSaegimDetail;
RoadViewSaegimDetail.contextType = Storage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;

  position: fixed;
  z-index: 150;
  top: 0;
  left: 0;
  background: black;
`

const TopBar = styled.div`
  display: flex;
  padding: 8px 24px 8px 24px;
  justify-content: space-between;
  align-items: center;
  
  &:before{
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 48px;
    background: black;
    opacity: 0.6;
    content: '';
  }
  
  color: white;
`;

const BackButton= styled(FlexRow)``;

const StCont = styled(FlexRow)`
  .MuiAvatar-root{
    max-width: 30px;
    max-height: 30px;
  }
`;

const StNick = styled.div`
  word-break: break-all;
  margin: 0 16px 0 16px;
`;

const W3WChip = styled.div`
  justify-content: space-between;
  align-items: center;
  display: flex;
  
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  
  .MuiChip-root{
    background-color: #fafafa;
  }
`;

const Contents = styled(FlexColumn) `
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
  z-index: 1;

  height: 50%;
`;

const BackGround = styled.div `
  position: absolute;
  z-index: -1;

  height: 100%;
  width: 100%;
  
  background-image: url(${props => props.bgImage});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 50% 50%;
`

const CardWrapper = styled.div `
  min-width: 80%;
`

const BotWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Registered = styled.div `
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 16px 8px 8px 24px;
`

const StAccessTime = styled(AccessTime)`
  margin-right: 8px;
`;

const Tags = styled.div `
  grid-area: tags;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: #fafafa;
  margin: 0 8px 8px 24px;
`

const Likes = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px 16px 8px 24px;
  margin-right: 24px;
`

const ContentsBot = styled.div`
  position: absolute;
  bottom: 5%;
  width: 100%;
  
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LockIcon = styled.div `
  color: #fafafa;
  margin-left: 32px;
`

const Communication = styled.div`
  height: 50%;
  background-color: white;
`

const Comments = styled.div`
  padding: 16px;
`

const Image = styled(FlexRow)`
  color: #fafafa;
  margin-right: 32px;
`;

const StPhotoIcon = styled(Photo)`
  margin-right: 4px;
`;

const StCard = styled(FlexColumn)`
  height: 25vh;
  width: 70vw;
  padding: 16px;

  word-break: break-all;
  overflow: scroll;
  
  @media (max-height: 850px) {
    max-height: 25vh;
  }
  @media (max-height: 700px) {
    max-height: 22vh;
  }
  @media (max-height: 600px) {
    max-height: 18vh;
  }
`;

const StImg = styled.img`
  width: 100%;
  height: 100%;
`;

const StMobileStepper = styled(MobileStepper)`
  border-radius: 0 0 15px 15px;
  
  &.MuiMobileStepper-dotActive{
    color: #ff6262;
  }
`;

const ImageWrapper = styled.div`
  padding: 24px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`;

const StClose = styled.div`
  padding: 8px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-radius: 15px 15px 0 0;
`;

const StTopBarR = styled(FlexRow)``;

const StChip = styled(Chip)`
  margin-right: 4px;
  background-color: #FBF2EE;
  box-shadow: 1px 0 2px gray;
`;