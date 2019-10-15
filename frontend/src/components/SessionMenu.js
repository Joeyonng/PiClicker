import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import moment from 'moment';

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth/withWidth";
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List';
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from '@material-ui/icons/Add'
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import PollOutlinedIcon from '@material-ui/icons/PollOutlined';

import Statistics from "./Statistics";
import Confirm from "./Confirm";
import {createSession, getSessions} from "../backend-api";
import {changeSessions} from "../redux";

const styles = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    iconButton: {
        padding: 8,
    },
    drawer: props => ({
        width: props.open ? 260 : 70,
        whiteSpace: 'nowrap',
        overflowX: 'hidden',
        transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    })
});

class SessionMenu extends Component {
    constructor(props) {
        super(props);
        //console.log("SessionMenu Constructor", this.props);

        this.state = {
            statisticsOpen: false,
            deleteConfirmOpen: false,
            selected: [],
        };
    }

    componentDidMount() {
        //console.log('SessionMenu: componentDidMount', this.props);
        this.fetchSessions(this.props.match.params.courseID)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('SessionMenu: componentDidUpdate', prevProps, this.props);
        if(this.props.match.params.courseID !== prevProps.match.params.courseID) {
            this.fetchSessions(this.props.match.params.courseID)
        }
    }

    fetchSessions(courseID) {
        getSessions(courseID).then(data => {
            let sessions = {};
            for(let session of data.sessions) {
                sessions[session.sessionID] = session;
            }
            this.props.changeSessions(sessions);
        }).catch(error => {
            console.log(error);
        });
    }

    addSession(courseID) {
        createSession(courseID).then(data => {
            let newSessions = this.props.sessions;
            newSessions[data.sessionID] = data;
            this.props.changeSessions(newSessions);

            this.props.history.push('/instructor/'
                + this.props.match.params.userID + '/'
                + this.props.match.params.courseID + '/' + data.sessionID
            );
        }).catch(error => {
            console.log(error);
        });
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <div>
                <Drawer
                    classes={{paper: mobile ? null : this.props.classes.drawer}}
                    anchor="right"
                    variant={mobile ? "temporary" : "permanent"}
                    open={this.props.open}
                    onClose={() => {
                        this.props.openCtl(false);
                        this.setState({selected: []});
                    }}
                >
                    {mobile ? null : <div className={this.props.classes.appBarSpacer}/>}
                    <ListItem>
                        <ListItemAvatar>
                            <IconButton
                                className={this.props.classes.iconButton}
                                onClick={() => {
                                    if(this.state.selected.length === 0) {
                                        this.addSession(this.props.match.params.courseID);
                                    }
                                    else {
                                        this.setState({selected: []});
                                    }
                                }}
                            >
                                {this.state.selected.length === 0 ? <AddIcon/> : <ClearIcon/>}
                            </IconButton>
                        </ListItemAvatar>

                        <ListItemText
                            primary={this.state.selected.length !== 0 ? this.state.selected.length : "Add Session"}
                        />

                        {this.state.selected.length === 0 ? null :
                            <div>
                                <IconButton
                                    className={this.props.classes.iconButton}
                                    onClick={() => {this.setState({statisticsOpen: true})}}
                                >
                                    <PollOutlinedIcon/>
                                </IconButton>

                                <IconButton
                                    className={this.props.classes.iconButton}
                                    onClick={() => {this.setState({deleteConfirmOpen: true})}}
                                >
                                    <DeleteOutlinedIcon/>
                                </IconButton>
                            </div>
                        }
                    </ListItem>

                    <Divider/>

                    <List>
                        {Object.values(this.props.sessions).reverse().map((session, index) => {
                            index = Object.values(this.props.sessions).length - index;
                            return (
                                <ListItem
                                    key={session.sessionID}
                                    button
                                    selected={this.props.match.params.sessionID === String(session.sessionID)}
                                    onClick={()=>{
                                        this.props.history.push('/instructor/'
                                            + this.props.match.params.userID + '/'
                                            + this.props.match.params.courseID + '/' + session.sessionID
                                        );

                                        if(mobile) {
                                            this.props.openCtl(false);
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <IconButton
                                            style={{padding: 0}}
                                            disabled={!this.props.open}
                                            onClick={(event) => {
                                                if(this.props.open) {
                                                    let newSelected = this.state.selected;
                                                    if(newSelected.indexOf(session.sessionID) === -1) {
                                                        newSelected.push(session.sessionID);
                                                    }
                                                    else {
                                                        newSelected.splice(newSelected.indexOf(session.sessionID), 1);
                                                    }
                                                    this.setState(newSelected);
                                                    event.stopPropagation();
                                                }
                                            }}
                                        >
                                            <Avatar>
                                                {this.state.selected.indexOf(session.sessionID) === -1 ? index : <DoneIcon/>}
                                            </Avatar>
                                        </IconButton>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={"Session " + index}
                                        secondary={moment(session.startTime).format("ddd, MM/DD/YYYY, H:mm")}
                                    />
                                </ListItem>
                            )
                        })}
                    </List>
                </Drawer>

                {/*<Confirm
                    open={this.state.deleteConfirmOpen}
                    openCtl={(open) => {this.setState({deleteConfirmOpen: open})}}
                    title={"Are you sure"}
                    content={"Are you sure you want to delete selected sessions? The polls in these sessions will also be deleted."}
                    confirm={() => {
                        Promise.all(
                            this.state.selected.map(session => deleteSession(this.props.account.email, session))
                        ).then(() => {
                            this.props.history.push('/polls/'  + this.props.match.params.course);
                            this.setState({selected: []})
                        })
                    }}
                />

                <Statistics
                    key={this.state.selected.reduce((acc, cur) => String(acc) + String(cur), "statistics: ")}
                    open={this.state.statisticsOpen}
                    openCtl={(open) => this.setState({statisticsOpen: open})}
                    course={this.props.courses[this.props.match.params.course]}
                    selectedSessions={this.state.selected}
                />*/}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeSessions: (data) => dispatch(changeSessions(data)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(SessionMenu))));
