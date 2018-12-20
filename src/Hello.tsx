import * as React from 'react';

export interface HelloProps {
  sender: string;
}

const Hello = (props: HelloProps) => <h1>Hello from {props.sender}</h1>;

export default Hello;
