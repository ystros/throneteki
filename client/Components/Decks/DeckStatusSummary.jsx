import React from 'react';

const DeckStatusSummary = ({ status }) => {
    let { basicRules, noUnreleasedCards, restrictedRules, noBannedCards, name } = status;
    const items = [
        { title: 'Basic deckbuilding rules', value: basicRules },
        { title: `${name} restricted list`, value: restrictedRules },
        { title: `${name} banned list`, value: noBannedCards },
        { title: 'Only released cards', value: noUnreleasedCards }
    ];

    return (
        <ul className='deck-status-summary'>
            {items.map((item, index) => (
                <li className={item.value ? 'valid' : 'invalid'} key={index}>
                    <span
                        className={
                            item.value ? 'glyphicon glyphicon-ok' : 'glyphicon glyphicon-remove'
                        }
                    />
                    {` ${item.title}`}
                </li>
            ))}
        </ul>
    );
};

export default DeckStatusSummary;
