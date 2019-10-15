import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, withRouter} from "react-router-dom";

import withStyles from '@material-ui/core/styles/withStyles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

import {changeAccount} from './../redux';
import {login, createInstructorAccount, createStudentAccount} from './../backend-api';
import withWidth from "@material-ui/core/withWidth/withWidth";

const styles = theme => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(2),
        marginTop: theme.spacing(10),
        [theme.breakpoints.up(400 + theme.spacing(3 * 2))]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    submit: {
        marginTop: theme.spacing(3),
    },
});

class Login extends Component {
    constructor(props) {
        super(props);
        //console.log("Login props", this.props);

        this.state = {
            tab: 0,
            username: '',
            usernameError: '',
            password: '',
            passwordError: '',
            repeatPassword: '',
            repeatPasswordError: '',
            key: '',
            keyError: '',
        };
    }

    render() {
        return(
            <Paper className={this.props.classes.paper}>
                <Tabs
                    value={this.state.tab}
                    centered
                    onChange={(event, newValue) => {
                        this.setState({
                            tab: newValue,
                            username: '',
                            usernameError: '',
                            password: '',
                            passwordError: '',
                            repeatPassword: '',
                            repeatPasswordError: '',
                            key: '',
                            keyError: '',
                        })
                    }}
                >
                    <Tab label="Sign In" />
                    <Tab label="Sign Up" />
                </Tabs>

                <TextField
                    fullWidth
                    margin="normal"
                    type="text"
                    label="Username"
                    value={this.state.username}
                    error={this.state.usernameError.length !== 0}
                    helperText={this.state.usernameError}
                    onChange={(event) => {
                        this.setState({
                            username: event.target.value,
                            usernameError: '',
                        });
                    }}
                />

                <TextField
                    fullWidth
                    margin="normal"
                    type="password"
                    label="Password"
                    value={this.state.password}
                    error={this.state.passwordError.length !== 0}
                    helperText={this.state.passwordError}
                    onChange={(event) => {
                        this.setState({
                            password: event.target.value,
                            passwordError: '',
                            repeatPasswordError: '',
                        });
                    }}
                />

                {this.state.tab === 0 ? null :
                    <TextField
                        fullWidth
                        margin="normal"
                        type="password"
                        label="Repeat password"
                        error={this.state.repeatPasswordError.length !== 0}
                        helperText={this.state.repeatPasswordError}
                        onChange={(event) => {
                            this.setState({
                                repeatPassword: event.target.value,
                                repeatPasswordError: '',
                            });
                        }}
                    />
                }

                {this.state.tab === 0 ? null :
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Instructor key"
                        error={this.state.keyError.length !== 0}
                        helperText={this.state.keyError}
                        onChange={(event) => {
                            this.setState({
                                key: event.target.value,
                                keyError: '',
                            });
                        }}
                    />
                }

                <Button
                    className={this.props.classes.submit}
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                        if(this.state.username === '') {
                            this.setState({usernameError: 'Username cannot be empty'})
                        }
                        else if(this.state.password === '') {
                            this.setState({passwordError: 'Password cannot be empty'})
                        }
                        else {
                            if (this.state.tab === 0) {
                                login(this.state.username, this.state.password).then(data => {
                                    this.props.changeAccount(data);
                                    this.props.history.push('/' + data.userType === 'i' ? 'instructor' : 'student');
                                }).catch(error => {
                                    console.log(error);
                                })
                            }
                            else {
                                if(this.state.password !== this.state.repeatPassword) {
                                    this.setState({repeatPasswordError: 'Password mismatch',})
                                }
                                else if(this.state.key === '') {
                                    createStudentAccount(this.state.username, this.state.password).then((data) => {
                                        this.props.changeAccount(data);
                                        this.props.history.push('/' + data.userType === 'i' ? 'instructor' : 'student');
                                    }).catch(error => {
                                        console.log(error);
                                    })
                                }
                                else if(this.state.key !== 'test') {
                                    this.setState({keyError: 'Key not correct',})
                                }
                                else {
                                    createInstructorAccount(this.state.username, this.state.password).then((data) => {
                                        this.props.changeAccount(data);
                                        this.props.history.push('/' + data.userType === 'i' ? 'instructor' : 'student');
                                    }).catch(error => {
                                        console.log(error);
                                    })
                                }
                            }
                        }

                    }}
                >
                    {this.state.tab === 0 ? "Sign in" : "Sign Up"}
                </Button>
            </Paper>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeAccount: (data) => dispatch(changeAccount(data)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(Login))));
