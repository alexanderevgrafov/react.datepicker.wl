import React from "react"
import moment from "moment"
import cx from "classnames"

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"],
    WDAYS = ["su", "mo", "tu", "we", "th", "fr", "sa"];

const Month = ({curdate, ...props})=> {
    let mnames = props.month_names || MONTHS,
        wdays = props.wday_names || WDAYS,
        day = moment(curdate).startOf('month').startOf('week').startOf('day'),//.day(-7),
        last = moment(curdate).endOf('month').endOf('week').startOf('day'),
        days = [];

    while (day.isBefore(last)) {
        let week = [];
        for (let d = 0; d < 7; d++) {
            week.push(<div className={ cx('cell', { out: day.month() != curdate.month(), today: day.dayOfYear() == moment().dayOfYear() }) }
                        key={ d }>{ day.date() }</div>);
            day.add(1, 'd');
        }
        days.push(<div className="row week" key={ day.date() }>{ week }</div>);
    }

    return (
        <div className="month">
            <div className="row">
                <div className="prev" onClick={ ()=>{props.shift(curdate.subtract(1, 'M'))} }> &lt; </div>
                <div className="title" onClick={ ()=>{props.zoom( 1 )} }>{ mnames[curdate.month()] }&nbsp;{ curdate.year() }</div>
                <div className="next" onClick={ ()=>{props.shift(curdate.add(1, 'M'))} }> &gt; </div>
            </div>
            <div className="row wdays">
                { _.map(wdays, wd => <div className="cell wdname" key={ wd }>{ wd }</div>) }
            </div>
            <div className="days">{ days }</div>
        </div>
    );
};

export default React.createClass({
    state: {
        curdate: Object
    },

    componentWillMount() {
        this.setState({ curdate: moment(this.props.date || new Date()) })
    },

    onShift( date ) {
        this.setState({ curdate: date });
    },

    onZoom( dir ) {
        console.log( 'Zoom ', dir>0 ? 'out' : 'in' );
    },

    render() {
        return <Month { ...this.props } curdate={ this.state.curdate } shift={ this.onShift } zoom={ this.onZoom }/>;
    }

})