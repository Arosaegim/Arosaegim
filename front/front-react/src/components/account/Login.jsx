import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import styled from 'styled-components';
import { Slide, Zoom, Checkbox, FormControlLabel } from '@material-ui/core';
import { Email, Lock, CheckCircle, Warning, } from '@material-ui/icons';

import { Storage } from '../../storage/Storage';
import BackBtn from  '../common/buttons/BackBtn';
import LogoAnimation from '../common/logo/LogoAnimation';
import UserInput from '../common/inputs/UserInput';
import Modal from '../common/modal/Modal';
import * as AM from './AccountMethod';
import * as AS from '../../styles/account/AccountStyles';
import * as AA from '../../apis/AccountAPI';

class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      slideIn: true,

      alertModal: false,

      email: '',
      emailLabel: '이메일',
      emailValid: 'init',

      pw: '',
      pwLabel: '비밀번호',
      pwValid: 'init',

      autoLogin: true,
    }
  }

  setStateAsync(state) {
    return new Promise(resolve => {
      this.setState(state, resolve);
    });
  }

  changeIcon = (flag) => {
    if(flag === 'email') {
      return (
        <>
          <Email style={{visibility: 'hidden'}}/>
          <Zoom in={this.state.emailValid === 'init'} style={{position: 'absolute', zIndex: 1, left: 0}}><Email/></Zoom>
          <Zoom in={this.state.emailValid === 'invalid'} style={{position: 'absolute', zIndex: 2, left: 0}}><Warning/></Zoom>
          <Zoom in={this.state.emailValid === 'valid'}  style={{position: 'absolute', zIndex: 3, left: 0}}><CheckCircle/></Zoom>
        </>
      )
    }
    else{
      return (
        <>
          <Lock style={{visibility: 'hidden'}}/>
          <Zoom in={this.state.pwValid === 'init'} style={{position: 'absolute', zIndex: 1, left: 0}}><Lock/></Zoom>
          <Zoom in={this.state.pwValid === 'invalid'} style={{position: 'absolute', zIndex: 2, left: 0}}><Warning/></Zoom>
          <Zoom in={this.state.pwValid === 'valid'}  style={{position: 'absolute', zIndex: 3, left: 0}}><CheckCircle/></Zoom>
        </>
      )
    }
  }

  handleInput = async (e) => {
    if(e.currentTarget.id === 'email'){
      await this.setStateAsync({ email: e.currentTarget.value })
      this.setState( await AM.checkLoginEmail(this.state.email) )
    }
    else {
      await this.setStateAsync({ pw: e.currentTarget.value })
      this.setState( AM.checkPW(this.state.pw) )
    }
  }

  handleAutoLogin = (e) => {
    this.setState({ autoLogin: !this.state.autoLogin })
  }

  handleSubmit = async () => {
    if(AM.checkAllValid('login', this.state)){
      localStorage.setItem('ARSG autoLogin', this.state.autoLogin)
      if(this.state.autoLogin){
        localStorage.setItem('ARSG email', this.state.email)
      }
      else {
        sessionStorage.setItem('ARSG email', this.state.email)
      }
      window.location.href = '/'
    }
    else{
      this.setState({ alertModal: true })
    }
  }
  
  handleBack = async () => {
    await this.setStateAsync({ slideIn: false })
    this.props.history.goBack()
  }

  render(){
    return(
      <Slide in={this.state.slideIn} direction="left">
        <AS.StFormCont height={this.context.appHeight}>
          
          {/* <AS.StBackBtn onClick={this.handleBack}>
            <ArrowBack/>
          </AS.StBackBtn> */}
          <BackBtn handleBack={this.handleBack}/>

          <LogoAnimation/>

          <UserInput 
            id='email' 
            value={this.state.email}
            label={this.state.emailLabel} 
            valid={this.state.emailValid}
            onChange={this.handleInput}
            icon={this.changeIcon('email')} 
          />

          <UserInput 
            id='pw' 
            value={this.state.pw} 
            label={this.state.pwLabel} 
            valid={this.state.pwValid}
            onChange={this.handleInput}
            icon={this.changeIcon('pw')} 
          />

          <StCheckBox
            control={<Checkbox 
                      color="default"
                      checked={this.state.autoLogin} 
                      onChange={this.handleAutoLogin}/>}
            label="자동 로그인"
          />
          
          <AS.StBtnCont>
            <AS.StBtn text="로그인" onClick={this.handleSubmit}/>
          </AS.StBtnCont>

          <AS.StLinkCont>
            <Link to='/signup' replace>가입하기</Link>
          </AS.StLinkCont>

          <Modal
            on={this.state.alertModal} 
            msg={`입력이\n올바르지 않습니다.`}
            click={() => { this.setState({ alertModal:false }) }} 
          />

        </AS.StFormCont>
      </Slide>
    )
  }
} export default Login;
Login.contextType = Storage;

const StCheckBox = styled(FormControlLabel)`
  & .Mui-checked{
    color: green;
  }
`;