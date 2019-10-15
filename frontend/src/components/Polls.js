import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import SwipeableViews from 'react-swipeable-views';

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from '@material-ui/icons/Add'
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import StopOutlinedIcon from '@material-ui/icons/StopOutlined';
import Fab from '@material-ui/core/Fab';

import Graph from "./Graph";
import {getActivityInfo, activatePoll, deactivatePoll, activateSession, deactivateSession, createPoll, getPolls} from '../backend-api'
import {changeActivity, changePolls} from "../redux";
import {Container} from "@material-ui/core";

const styles = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    mainPage: props => ({
        marginLeft: props.userMenuOpen ? 260 : 0,
        marginRight: props.sessionMenuOpen ? 260 : 70,
        transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    }),
    fabs: props => ({
        position: 'fixed',
        bottom: 0,
        right: props.sessionMenuOpen ? 260 : 70,
        transition: theme.transitions.create(['right'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    }),
    fab: {
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(2),
    }
});

class Polls extends Component {
    constructor(props) {
        super(props);
        //console.log("Polls Constructor", this.props);

        this.state = {
        };
    }

    componentDidMount() {
        //console.log('Polls: componentDidMount', this.props);
        this.fetchPolls(this.props.match.params.sessionID)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('Polls: componentDidUpdate', prevProps, this.props);
        if(this.props.match.params.sessionID !== prevProps.match.params.sessionID) {
            this.fetchPolls(this.props.match.params.sessionID)
        }
    }

    fetchPolls(sessionID) {
        getPolls(sessionID).then(data => {
            let polls = {};
            for(let poll of data.polls) {
                polls[poll.pollID] = poll;
            }
            this.props.changePolls(polls)
        }).catch(error => {
            console.log(error);
        });
    }

    mapActionToActivity(actionID) {
        let activity = new Promise((resolve, reject) => {
            switch(actionID) {
                case 0:
                    activateSession(this.props.match.params.sessionID).then(() => {
                        resolve();
                    }).catch(error => {
                        reject(error);
                    });
                    break;
                case 1:
                    createPoll(this.props.match.params.sessionID).then(data => {
                        let newPolls = this.props.polls;
                        newPolls[data.pollID] = data;
                        this.props.changePolls(newPolls);

                        activatePoll(data.pollID).then(() => {
                            resolve();
                        }).catch(error => {
                            reject(error);
                        })
                    }).catch(error => {
                        reject(error);
                    });
                    break;
                case 2:
                    deactivatePoll().then(() => {
                        resolve();
                    }).catch(error => {
                        reject(error);
                    });
                    break;
                default:
                    deactivateSession().then(() => {
                        resolve();
                    }).catch(error => {
                        reject(error);
                    });
                    break;
            }
        });

        activity.then(() => {
            getActivityInfo().then(data => {
                this.props.changeActivity(data);
            }).catch(error => {
                console.log(error);
            })
        }).catch((error) => {
            console.log(error)
        })
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        let actionID = 0;
        if(this.props.activity.sessionID === Number(this.props.match.params.sessionID)) {
            if(this.props.activity.pollID === null) {
                actionID = 1;
            }
            else {
                actionID = 2;
            }
        }

        return (
            <div className={mobile ? null : this.props.classes.mainPage}>
                <div className={this.props.classes.appBarSpacer}/>

                {mobile ?
                    <SwipeableViews
                        index={Math.max(0, Object.keys(this.props.polls).length - 1)}
                    >
                        {Object.values(this.props.polls).map((poll, index) => {
                            return (
                                <Graph
                                    key={poll.pollID}
                                    index={index + 1}
                                    poll={poll}
                                    course={this.props.courses[this.props.match.params.course]}
                                />
                            )
                        })}
                    </SwipeableViews>
                    :
                    <Container maxWidth="md">
                        {Object.values(this.props.polls).reverse().map((poll, index) => {
                            index = Object.values(this.props.polls).length - index;
                            return (
                                <div>
                                    <Graph
                                        key={poll.pollID}
                                        index={index}
                                        poll={poll}
                                        course={this.props.courses[this.props.match.params.course]}
                                    />
                                    <Divider key={poll.pollID + 'divider'}/>
                                </div>
                            )
                        })}
                    </Container>
                }

                <div className={this.props.classes.fabs}>
                    {actionID !== 1 ? null :
                        <Tooltip
                            aria-label="Stop Session"
                            title={"Stop Session"}
                            placement='left'
                        >
                            <Fab
                                className={this.props.classes.fab}
                                color="default"
                                onClick={() => {this.mapActionToActivity(3)}}
                            >
                                <StopOutlinedIcon/>
                            </Fab>
                        </Tooltip>
                    }

                    <br/>

                    <Tooltip
                        aria-label={['Start Session', 'Create Poll', 'Stop Poll'][actionID]}
                        title={['Start Session', 'Create Poll', 'Stop Poll'][actionID]}
                        placement='left'
                    >
                        <Fab
                            className={this.props.classes.fab}
                            color="default"
                            onClick={() => {this.mapActionToActivity(actionID)}}
                        >
                            {[<PlayArrowIcon/>, <AddIcon/>, <PauseIcon/>][actionID]}
                        </Fab>
                    </Tooltip>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changePolls: (data) => dispatch(changePolls(data)),
        changeActivity: (data) => dispatch(changeActivity(data)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(Polls))));
