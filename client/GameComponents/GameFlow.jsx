import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

class GameFlow extends React.Component {
    constructor() {
        super();
        this.state = { showPhase: new Map() };
    }

    renderGameStep(step, forceExpand) {
        if(!forceExpand) {
            forceExpand = this.isShowPhase(step.id);
        }
        let className = 'game-step';
        className += ' ' + step.windowType;
        let collapsable = step.windowType === 'phaseWindow' && step.steps && step.steps.length > 0;
        let expand = forceExpand && step.steps && step.steps.length > 0;
        if(this.props.currentStep === step.id) {
            className += ' active';
            expand = true;
            collapsable = false;
        } else if(_.any(step.steps, subStep => subStep.id === this.props.currentStep || _.any(subStep.steps, ss => ss.id === this.props.currentStep))) {
            className += ' child-active';
            expand = true;
            collapsable = false;
        }
        
        if(this.props.currentChallengeType) {
            className += ' ' + this.props.currentChallengeType;
        }

        return (
            <div key={ 'game-step-' + step.id } className={ className }>
                <label>
                    { this.renderActionWindowCheckbox(step) }
                    { this.renderActionWindowTitle(step.title) }
                </label>
                { this.renderCollapseToggle(step.id, collapsable, expand) }
                { _.map(step.steps, subStep => {
                    if(expand) {
                        return this.renderGameStep(subStep, expand);
                    } 
                }) }
            </div>);
    }

    isShowPhase(id) {        
        if(!this.state.showPhase.get(id)) {
            this.state.showPhase.set(id, false);
        }
        return this.state.showPhase.get(id);
    }

    onToggleCollapse(id) {        
        if(!this.state.showPhase.get(id)) {
            this.state.showPhase.set(id, false);
        }
        this.state.showPhase.set(id,!this.state.showPhase.get(id));
        this.setState({ showPhase: this.state.showPhase });
    }

    renderCollapseToggle(id, collapsable, expand) {
        if(!collapsable) {
            return;
        }
        let glyph = expand ? 'glyphicon-collapse-up' : 'glyphicon-collapse-down';
        return (<a href='#' onClick={ () => this.onToggleCollapse(id) }>
            <span className={ 'glyphicon ' + glyph } />
        </a>);
    }

    renderActionWindowCheckbox(step) {
        if(!step.setting) {
            return;
        }

        let checked = this.props.actionWindows[step.setting];

        return (
            <input type='checkbox'
                checked={ checked }
                onChange={ () => this.props.onActionWindowToggle(step.setting, !checked) } />);
    }

    renderActionWindowTitle(title) {
        if(!title) {
            return;
        }
        let result = [];
        title = title.replace(/#challengeType#/, '|#challengeType#|');

        if(title.startsWith('|')) {
            title = title.substr(1);
        }

        if(title.endsWith('|')) {
            title = title.substr(0, title.length - 1);
        }

        result = _.map(title.split('|'),
            _s => {
                if(_s === '#challengeType#') {
                    if(this.props.currentChallengeType) {
                        return (<span className={ 'icon-' + this.props.currentChallengeType } />);
                    }
                } else {
                    return _s;
                }
            });

        return result;
    }

    render() {
        return (
            <div className='game-flow panel'>
                { _.map(this.props.gameSteps, step => this.renderGameStep(step)) }
            </div>);
    }
}

GameFlow.displayName = 'GameFlow';
GameFlow.propTypes = {
    actionWindows: PropTypes.object,
    currentChallengeType: PropTypes.string,
    currentStep: PropTypes.string,    
    gameSteps: PropTypes.array,
    onActionWindowToggle: PropTypes.func
};

export default GameFlow;
