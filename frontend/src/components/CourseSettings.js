import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import Moment from 'moment';
import MomentUtils from '@date-io/moment';
import {MuiPickersUtilsProvider, TimePicker} from '@material-ui/pickers';
import ChipInput from "material-ui-chip-input";

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import TextField from "@material-ui/core/TextField";
import Button from '@material-ui/core/Button';
import FormControl from "@material-ui/core/FormControl";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import LinearProgress from "@material-ui/core/LinearProgress";

const styles = theme => ({
});

class CourseSettings extends React.Component {
    constructor(props) {
        super(props);
        //console.log("CourseSettings props", this.props);

        this.course = this.props.courses[this.props.match.params.course];
        this.state = {
            nameError: '',
            dateError: '',
            timeError: '',
            categoriesError: '',
        };

        Object.assign(this.state, !this.props.newCourse ? {
            name: this.course.name,
            date: this.course.date,
            startTime: new Moment(this.course.startTime),
            endTime: new Moment(this.course.endTime),
            categories: this.course.categories,
            students: this.course.students,
            numSessions: this.course.numSessions,
        } : {
            name: '',
            date: [false, false, false, false, false],
            startTime: new Moment().hour(8).minute(0),
            endTime: new Moment().hour(9).minute(0),
            categories: {},
            students: {},
            numSessions: 0,
        });
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        let dateValues = [];
        for(let index in this.state.date) {
            if(this.state.date[index]) {
                dateValues.push(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][index])
            }
        }

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                fullScreen={mobile}
                fullWidth
                maxWidth="sm"
                open={this.props.open}
                onClose={() => {this.props.openCtl(false)}}
            >
                <DialogTitle>
                    {this.props.newCourse ? 'Add Course' : this.course.name + ' Course Settings'}
                </DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Course Name Or Course ID"
                        value={this.state.name}
                        error={this.state.nameError.length !== 0}
                        helperText={this.state.nameError}
                        disabled={!this.props.newCourse}
                        onChange={(event) => {
                            this.setState({
                                name: event.target.value,
                                nameError: '',
                            });
                        }}
                    />

                    <FormControl
                        fullWidth
                        margin="normal"
                    >
                        <InputLabel>Choose date</InputLabel>
                        <Select
                            multiple
                            value={dateValues}
                            onChange={(event) => {
                                let newDate = [false, false, false, false, false];
                                for (let value of event.target.value) {
                                    let index = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(value);
                                    if (index !== -1) {
                                        newDate[index] = true;
                                    }
                                }

                                this.setState({
                                    date: newDate,
                                    dateError: '',
                                });
                            }}
                        >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(date => (
                                <MenuItem
                                    button={true}
                                    key={date}
                                    value={date}
                                >
                                    {date}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <TimePicker
                            ampm={false}
                            fullWidth
                            margin="normal"
                            label="Start Time"
                            value={this.state.startTime}
                            error={this.state.timeError.length !== 0}
                            helperText={this.state.timeError}
                            onChange={(time) => {
                                let dateCount = 0;
                                for (let dateSelected of this.state.date) {
                                    if (dateSelected === true) {
                                        dateCount++;
                                    }
                                }

                                let endTime = Moment(time);
                                switch (dateCount) {
                                    case 1:
                                        endTime.add(3, 'h');
                                        break;
                                    case 2:
                                        endTime.add(1, 'h').add(20, 'm');
                                        break;
                                    case 3:
                                        endTime.add(50, 'm');
                                        break;
                                    default:
                                        endTime.add(1, 'h');
                                }

                                this.setState({
                                    startTime: time,
                                    endTime: endTime,
                                    timeError: '',
                                });
                            }}
                        />

                        <TimePicker
                            ampm={false}
                            fullWidth
                            margin="normal"
                            label="End Time"
                            value={this.state.endTime}
                            error={this.state.timeError.length !== 0}
                            helperText={this.state.timeError}
                            onChange={(time) => {
                                this.setState({
                                    endTime: time,
                                    timeError: '',
                                })
                            }}
                        />
                    </MuiPickersUtilsProvider>

                    <ChipInput
                        fullWidth
                        margin="normal"
                        label="Categories"
                        placeholder=""
                        value={Object.keys(this.state.categories)}
                        onAdd={(chip) => {
                            let newCategories = this.state.categories;
                            newCategories[chip] = [];
                            this.setState({categories: newCategories});
                        }}
                        onDelete={(chip) => {
                            let newCategories = this.state.categories;
                            delete newCategories[chip];
                            this.setState({categories: newCategories});
                        }}
                    />

                    {Object.keys(this.state.categories).map((category) =>
                        <ChipInput
                            key={category}
                            fullWidth
                            margin="normal"
                            label={category}
                            placeholder=""
                            value={this.state.categories[category]}
                            onAdd={(chip) => {
                                let newCategories = this.state.categories;
                                newCategories[category].push(chip);
                                this.setState({categories: newCategories});
                            }}
                            onDelete={(chip) => {
                                let newCategories = this.state.categories;
                                newCategories[category].splice(newCategories[category].indexOf(chip), 1);
                                this.setState({categories: newCategories});
                            }}
                        />
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        color="primary"
                        onClick={() => {
                            this.props.openCtl(false);
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        color="primary"
                        onClick={() => {
                            let error = false;

                            // The course name cannot be empty
                            if(this.state.name.length === 0) {
                                this.setState({
                                    nameError: 'The course identifier cannot be empty!'
                                });
                                error = true;
                            }

                            // The course date field cannot be empty
                            let dateError = true;
                            for(let dateSelected in this.state.date) {
                                if(this.state.date[dateSelected]) {
                                    dateError = false;
                                    break;
                                }
                            }
                            if(dateError) {
                                this.setState({
                                    dateError: 'Please select dates'
                                });
                                error = true;
                            }

                            // The end time must be after than the start time
                            if(this.state.endTime.diff(this.state.startTime, 'minutes') <= 0) {
                                this.setState({
                                    timeError: 'The end time must be larger than start time!'
                                });
                                error = true;
                            }

                            // If there are no errors, query the database to see if there is any name duplicate
                            if(!error) {
                                if(this.props.courses[this.state.name] !== undefined) {
                                    if(this.props.newCourse || this.state.name !== this.props.match.params.course) {
                                        this.setState({
                                            nameError: 'The course identifier is already taken!'
                                        });
                                        return;
                                    }
                                }

                                /*
                                setCourse(this.props.account.email, {
                                    name: this.state.name,
                                    date: this.state.date,
                                    startTime: this.state.startTime.valueOf(),
                                    endTime: this.state.endTime.valueOf(),
                                    categories: this.state.categories,
                                    students: this.state.students,
                                    numSessions: this.state.numSessions,
                                }, !this.props.newCourse);
                                 */

                                this.props.openCtl(false);
                            }
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>

            </Dialog>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(CourseSettings))));
