import React from 'react';
// import { action } from '@storybook/addon-actions';
import DefaultButton from './DefaultButton';

export default {
  component: DefaultButton,
  title: 'Button',
};

export const defaultbtn = () => <DefaultButton text="default-msg" />
