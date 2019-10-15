import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import moment from "moment";
import {Bar} from 'react-chartjs-2';

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth/withWidth";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import {amber, cyan, blue, purple, orange, teal, lime, brown} from '@material-ui/core/colors';
import Skeleton from '@material-ui/lab/Skeleton';

import {getPollStudents} from "../backend-api";

const shade = 200;
const colors = [amber[shade], cyan[shade], blue[shade], purple[shade], orange[shade], teal[shade], lime[shade], brown[shade]];

const styles = theme => ({
    card: {
        height: 320,
        marginTop: theme.spacing(),
        marginBottom: theme.spacing(),
    },
    bar: {
        height: 250,
    },
    image: {
        height: 320,
    },
    categoryButton: {
        height: 72,
    },
    listItem0: { backgroundColor: colors[0] + '!important', },
    listItem1: { backgroundColor: colors[1] + '!important', },
    listItem2: { backgroundColor: colors[2] + '!important', },
    listItem3: { backgroundColor: colors[3] + '!important', },
    listItem4: { backgroundColor: colors[4] + '!important', },
    listItem5: { backgroundColor: colors[5] + '!important', },
    listItem6: { backgroundColor: colors[6] + '!important', },
    listItem7: { backgroundColor: colors[7] + '!important', },
});

class Graph extends Component {
    constructor(props) {
        super(props);
        //console.log("Graph Constructor", this.props);

        this.state = {
            result: null,
            imageUrl: null,
            category: 'All Categories',
            categoryAnchorEl: null,
            subcategories: {},
        };
    }

    componentDidMount() {
        //console.log('Graph: componentDidMount', this.props);
        this.fetchResult(this.props.pollID)

        /*
        getImageUrl(this.props.account.email + '/' + this.props.poll.id, url => {
            this.setState({imageUrl: url})
        }, err => {});
         */
    }

    fetchResult(pollID) {
        getPollStudents(pollID).then(data => {
            let result = {};
            for(let student of data.students) {
                result[student.studentID] = student.vote;
            }
            this.setState({result: result})
        }).catch(error => {
            console.log(error);
        });
    }

    getPollData(result, course, category) {
        let data = {
            Total: [0, 0, 0, 0, 0],
        };

        if (course !== undefined && course.name !== 'unknown' && category !== 'All Categories') {
            for (let subcategory of course.categories[category]) {
                data[subcategory] = [0, 0, 0, 0, 0];
            }
            data['Unknown'] = [0, 0, 0, 0, 0]
        }

        // Fulfill datasets with poll results
        for (let id in result) {
            // Get the student's answer
            let answer = result[id];

            // Check whether the answer is valid or not
            let answerIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(answer);
            if(answerIndex === -1) {
                continue;
            }

            data['Total'][answerIndex]++;

            if (course !== undefined && course.name !== 'unknown' && category !== 'All Categories') {
                // Student's default subcategory is 'Unknown'
                let subcategory = 'Unknown';

                // Get the student's subcategory in category
                if(course.students[id] !== undefined) {
                    let subcategoryIndex = course.students[id][category];
                    if (subcategoryIndex !== -1) {
                        subcategory = course.categories[category][subcategoryIndex];
                    }
                }

                // Increment the count of the answer in the student's option by 1
                data[subcategory][answerIndex]++;
            }
        }

        return data;
    };

    getGraphData(pollData) {
        let datasets = [{
            label: 'No Data',
            data: [0, 0, 0, 0, 0]
        }];

        let sum = 0;
        for(let subTotal in pollData['Total']) {
            sum += pollData['Total'][subTotal];
        }

        if(pollData !== {}) {
            // If the poll is not empty, delete the default option
            datasets.splice(0, 1);

            let restCount = Array.from(pollData['Total']);
            for(let subcategory in this.state.subcategories) {
                if(this.state.subcategories[subcategory].checked) {
                    datasets.push({
                        label: subcategory,
                        data: pollData[subcategory].map((count) => Math.ceil((count / sum) * 100)),
                        backgroundColor: colors[this.state.subcategories[subcategory].index],
                    });

                    // Count the number of rest polls
                    for(let index in restCount) {
                        restCount[index] = restCount[index] - pollData[subcategory][index];
                    }
                }
            }

            datasets.push({
                label: 'Rest',
                data: restCount.map((count) => Math.ceil((count / sum) * 100)),
            });
        }

        return {
            labels: ['A', 'B', 'C', 'D', 'E'],
            datasets,
        }
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <div>
                <Card
                    className={mobile ? null : this.props.classes.card}
                    elevation={0}
                >
                    <Grid container spacing={1}>
                        <Grid item md={4} xs={12}>
                            <CardHeader
                                avatar={<Avatar>{this.props.index}</Avatar>}
                                title={moment(Number(this.props.poll.startTime)).format("ddd, MMM Do YYYY, H:mm")}
                                subheader={this.state.result === null ?
                                    <Skeleton height={6} width="60%"/> :
                                    Object.keys(this.state.result).length + ' Student Responses'
                                }
                            />

                            {this.state.result === null ?
                                <Skeleton variant="rect" className={this.props.classes.bar}/> :
                                <Paper className={this.props.classes.bar} elevation={0}>
                                    <Bar
                                        data={this.getGraphData(this.getPollData(this.state.result, this.props.course, this.state.category))}
                                        redraw={true}
                                        options={{
                                            maintainAspectRatio: false,
                                            animation: false,
                                            scales: {
                                                xAxes: [{
                                                    stacked: true,
                                                }],
                                                yAxes: [{
                                                    stacked: true,
                                                    suggestedMin: 0,
                                                    ticks: {
                                                        min: 0,
                                                        max: 100,
                                                        callback: value => value + "%",
                                                    },
                                                }]
                                            },
                                        }}
                                        legend={{display: false}}
                                    />
                                </Paper>
                            }
                        </Grid>

                        <Grid item md={3} xs={12}>
                            <Button
                                className={mobile ? null : this.props.classes.categoryButton}
                                fullWidth={true}
                                disabled={this.props.course === undefined || this.props.course.name === 'unknown' ? true :
                                    Object.keys(this.props.course.categories).length === 0}
                                aria-owns={this.state.anchorEl ? 'category-menu' : undefined}
                                aria-haspopup="true"
                                onClick={(event) => {
                                    this.setState({categoryAnchorEl: event.currentTarget})
                                }}
                            >
                                {this.state.category}
                            </Button>

                            <List dense>
                                {Object.keys(this.state.subcategories).map((title) => {
                                    let listItemStyle = 'listItem' + this.state.subcategories[title].index;
                                    return (
                                        <ListItem
                                            key={title}
                                            divider
                                            selected={this.state.subcategories[title].checked}
                                            button
                                            onClick={() => {
                                                let newState = {...this.state.subcategories};
                                                for(let subCategory in newState) {
                                                    newState[subCategory].checked = subCategory === title;
                                                }
                                                this.setState(newState)
                                            }}
                                            classes={{selected: this.props.classes[listItemStyle]}}
                                        >
                                            <ListItemText primary={title} />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    onClick={() => {
                                                        let newState = {...this.state.subcategories};
                                                        newState[title].checked = !newState[title].checked;
                                                        this.setState(newState);
                                                    }}
                                                >
                                                    {this.state.subcategories[title].checked ? <RemoveIcon/> : <AddIcon/>}
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    )
                                })}
                            </List>
                        </Grid>

                        <Grid item md={5} xs={12}>
                            {this.state.imageUrl === null ?
                                <Skeleton variant="rect" className={this.props.classes.image}/> :
                                <CardMedia
                                    style={{objectFit: 'contain'}}
                                    component="img"
                                    height={mobile ? null : "320"}
                                    image={this.state.imageUrl}
                                />
                            }
                        </Grid>
                    </Grid>
                </Card>

                {this.props.course === undefined ? null : this.props.course.name === 'unknown' ? null :
                    <Menu
                        id="category-menu"
                        anchorEl={this.state.categoryAnchorEl}
                        open={Boolean(this.state.categoryAnchorEl)}
                        onClose={() => {
                            this.setState({ categoryAnchorEl: null })
                        }}
                    >
                        {['All Categories'].concat(Object.keys(this.props.course.categories)).map((title) => (
                            <MenuItem
                                button={true}
                                key={title}
                                onClick={()=>{
                                    let newSubcategories = {};
                                    if(title !== 'All Categories') {
                                        let subcategories = this.props.course.categories[title];
                                        for (let subcategory of subcategories) {
                                            newSubcategories[subcategory] = {
                                                checked: true,
                                                index: subcategories.indexOf(subcategory),
                                            };
                                        }
                                        newSubcategories['Unknown'] = {
                                            checked: true,
                                            index: subcategories.length,
                                        }
                                    }

                                    this.setState({
                                        category: title,
                                        categoryAnchorEl: null,
                                        subcategories: newSubcategories,
                                    });
                                }}
                            >
                                {title}
                            </MenuItem>
                        ))}
                    </Menu>
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(Graph))));
