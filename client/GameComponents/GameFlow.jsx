import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

class GameFlow extends React.Component {
    renderGameStep(step) {
        let className = 'game-step';
        if(this.props.currentStep === step.id) {
            className += ' active';
        } else if(_.any(step.steps, subStep => subStep.id === this.props.currentStep)) {
            className += ' child-active';
        }

        return (
            <div key={ 'game-step-' + step.id } className={ className }>
                <label>
                    { this.renderActionWindowCheckbox(step) }
                    { step.title }
                </label>
                { _.map(step.steps, subStep => this.renderGameStep(subStep, this.props.actionWindows)) }
            </div>);
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
    currentStep: PropTypes.string,
    gameSteps: PropTypes.array,
    onActionWindowToggle: PropTypes.func
};

export default GameFlow;
