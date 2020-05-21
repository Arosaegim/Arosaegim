import React, { Component } from 'react';
import styled from 'styled-components';
import { Button, Zoom } from '@material-ui/core';

class Modal extends Component {

  render(){
    return(
      <>
        { this.props.on && <StOpacityBack/> }

        <Zoom in={this.props.on} mountOnEnter unmountOnExit>
        <StModalCont>
          <StConfirmCont>
            <div className="top-deco"/>
            <StMsgCont>{this.props.msg}</StMsgCont>
            <StBtnCont>
            {
              this.props.confirm ? 
              <>
                <Button id="yes" variant="outlined" onClick={this.props.modalConfirm}>예</Button>
                <Button id="no" variant="outlined" onClick={this.props.modalConfirm}>아니요</Button>
              </>
              :
              <Button id="no" variant="outlined" onClick={this.props.modalConfirm}>확인</Button>
            }
            </StBtnCont>
          </StConfirmCont>
        </StModalCont>
        </Zoom>
      </>
    )
  }
} export default Modal;

const StOpacityBack = styled.div`
  position: fixed;
  top: 0;
  z-index: 100;

  width: 100%;
  height: 100%;

  background: black;
  opacity: 0.3;
`;

const StModalCont = styled.div`
  position: fixed;  
  z-index: 101;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`

const StConfirmCont = styled.div`
  z-index: 200;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 60%;
  height: 30%;
  background-color: white;
  border-radius: 15px;
  opacity: 1;

  .top-deco{
    width: 100%;
    height: 20%;
    /* background: linear-gradient(to right, #66ffff 22%, #ff99cc 100%); */
    background: gray;
    border: 2px solid white;
    border-radius: 15px 15px 0 0;
    box-sizing: border-box;
  }
`

const StMsgCont = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 1rem 0 1rem;
`

const StBtnCont = styled.div`
  display: flex;
  align-self: stretch;
  justify-content: space-around;
  margin: 0 1rem 1rem 1rem;
  
  .MuiButton-label{
    color: #8989f5;   
  }
`