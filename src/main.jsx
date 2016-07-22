import React from "react"
import {TransitionMotion, spring } from 'react-motion'
import moment from "moment"
import cx from "classnames"

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
    WDAYS = ["su", "mo", "tu", "we", "th", "fr", "sa"];

const LevelTags = {
    month: ({curdate, ...props})=> {
        let mnames = props.month_names || MONTHS,
            wdays = props.wday_names || WDAYS,
            day = moment(curdate).startOf('month').startOf('week').startOf('day'),//.day(-7),
            last = moment(curdate).endOf('month').endOf('week').startOf('day'),
            days = [],
            maxDate = props.maxDate && moment(props.maxDate),
            minDate = props.minDate && moment(props.minDate);

        let header = <div className="row">
            { minDate && minDate.isSameOrAfter(day)   ? <div className="noshift"></div> : <div className="prev"
                                                                                               onClick={ ()=>{props.onShift(curdate.subtract(1, 'M'))} }> &lt; </div>}
            <div className="title"
                 onClick={ ()=>{props.onLevel( 'year', false )} }>{ mnames[curdate.month()] }&nbsp;{ curdate.year() }</div>
            { maxDate && maxDate.isSameOrBefore(last) ? <div className="noshift"></div> : <div className="next"
                                                                                               onClick={ ()=>{props.onShift(curdate.add(1, 'M'))} }> &gt; </div> }
        </div>;

        while (day.isBefore(last)) {
            let week = [];
            for (let d = 0; d < 7; d++) {
                let isOut = (maxDate && day.isAfter(maxDate)) || (minDate && day.isBefore(minDate)),
                    date = day.clone();
                week.push(<div
                    className={ cx('cell', { 
                        other: day.month() != curdate.month(), 
                        out: isOut,
                        today: day.dayOfYear() == moment().dayOfYear() }) 
                      }
                    onClick={ isOut ? null : ()=>{props.onSelect( date )} }
                    key={ d }>{ day.date() }</div>);
                day.add(1, 'd');
            }
            days.push(<div className="row week" key={ day.date() }>{ week }</div>);
        }

        return (
            <div className="body month">
                { header }
                <div className="row wdays">
                    { _.map(wdays, wd => <div className="cell wdname" key={ wd }>{ wd }</div>) }
                </div>
                <div className="days">{ days }</div>
            </div>
        );
    },
    year: ({curdate, ...props})=> {
        let mnames = props.month_names || MONTHS,
            months = [],
            max = props.maxDate && moment(props.maxDate),
            min = props.minDate && moment(props.minDate);

        min = min && curdate.year() == min.year() && min.month() + 1;
        max = max && curdate.year() == max.year() && max.month() + 1;

        for (let j = 0; j < 3; j++) {
            let season = [];
            for (let i = 0; i < 4; i++) {
                let k = j * 4 + i,
                    isOut = (max && k + 1 > max) || (min && k + 1 < min);

                season.push(<div className={ cx('cell', { out: isOut })} key={ k }
                                 onClick={ isOut ? null : ()=>{ props.onLevel( 'month', true, new moment(curdate).month( k ) ) }}>{ mnames[ k ] }</div>);
            }
            months.push(<div className="row" key={ j }>{ season }</div>);
        }

        return (
            <div className="body year">
                <div className="row">
                    { min ? <div className="noshift"></div> : <div className="prev"
                                                                   onClick={ ()=>{props.onShift(curdate.subtract(1, 'Y'))} }> &lt; </div> }
                    <div className="title" onClick={ ()=>{props.onLevel( 'decade', false )} }>{ curdate.year() }</div>
                    { max ? <div className="noshift"></div> : <div className="next"
                                                                   onClick={ ()=>{props.onShift(curdate.add(1, 'Y'))} }> &gt; </div> }
                </div>
                <div className="months">{ months }</div>
            </div>
        );
    },
    decade: ({curdate, ...props})=> {
        let start = (Math.floor(curdate.year() / 10)) * 10 - 1,
            years = [],
            max = props.maxDate && moment(props.maxDate),
            min = props.minDate && moment(props.minDate);

        min = min && min.year();
        min = min >= start && min <= start + 10 && min;

        max = max && max.year();
        max = max >= start && max <= start + 10 && max;

        for (let j = 0; j < 3; j++) {
            let ys = [];
            for (let i = 0; i < 4; i++) {
                let k = j * 4 + i,
                    isOut = (max && start + k > max) || (min && start + k < min);
                ys.push(<div className={cx('cell',{other:!k||k==11, out: isOut })} key={ k }
                             onClick={ isOut ? null : ()=>{ props.onLevel( 'year', true, new moment().year(start + k) ) }}>{ start + k }</div>);
            }
            years.push(<div className="row" key={ j }>{ ys }</div>);
        }

        return (
            <div className="body decade">
                <div className="row">
                    { min ? <div className="noshift"></div> : <div className="prev"
                                                                   onClick={ ()=>{props.onShift(curdate.subtract(10, 'Y'))} }> &lt; </div> }
                    <div className="title">{ start + 1 } - { start + 10 }</div>
                    { max ? <div className="noshift"></div> : <div className="next"
                                                                   onClick={ ()=>{props.onShift(curdate.add(10, 'Y'))} }> &gt; </div> }
                </div>
                <div className="years">{ years }</div>
            </div>
        );
    }
};

export default React.createClass({
    prevDate: null,
    prevLevel: null,

    componentWillMount() {
        let date = moment(this.props.date || new Date());
        this.prevdate = date.clone();
        this.prevlevel = 'month';
        this.setState({curdate: date, level: 'month', animId: 0});
    },

    onShift(date) {
        this.prevdate = this.state.curdate.clone();
        this.setState({
            curdate: date,
            direction: date.isAfter(this.state.curdate) ? 'right' : 'left',
            animId: this.state.animId + 1
        });
    },

    onLevel(level, is_zoom, date) {
        let dt = {
            level: level,
            direction: is_zoom ? 'down' : 'up',
            animId: this.state.animId + 1
        };
        this.prevlevel = this.state.level;
        date && (dt.curdate = date);
        this.setState(dt);
    },

    onSelect(date) {
        console.log('Date selected', date.toString());
    },

    willEnterLeave(welcome){
        switch (this.state.direction) {
            case 'left':
                return {zoom: 0, slide: welcome ? -1 : spring(1)};
            case 'right':
                return {zoom: 0, slide: welcome ? 1 : spring(-1)};
            case 'up':
                return {zoom: welcome ? 1 : spring(-1), slide: 0};
            case 'down':
                return {zoom: welcome ? -1 : spring(1), slide: 0};
        }
        return null;
    },

    render()            {
        return <TransitionMotion
            willEnter={ ()=>this.willEnterLeave(true) }
            willLeave={ ()=>this.willEnterLeave(false) }
            styles={[{ key: 'k' + this.state.animId, style:{ slide:spring(0), zoom:spring(0) }}]}
        >{ interpolate => {
            return <div className="calendar_wl_box">{
                interpolate.map( conf => {
                    return <div className="calendar_wl_container" key={ conf.key }
                                style={ {
                                left: conf.style.slide*100 + '%',
                                opacity: 1 - Math.abs(conf.style.zoom + conf.style.slide),
                                transform: 'scale( '+(conf.style.zoom + 1 ) + ')',
                                zIndex: conf.key == this.state.animId ? 2 : 1
                                } }>{
                        React.createElement(LevelTags[conf.key == this.state.animId ? this.state.level : this.prevlevel], Object.assign({}, this.props, {
                            curdate: conf.key == this.state.animId ? this.state.curdate.clone() : this.prevdate,
                            onShift: this.onShift,
                            onLevel: this.onLevel,
                            onSelect: this.onSelect
                            }))
                        }</div>})
                }</div>}
            }</TransitionMotion>;
    }
})