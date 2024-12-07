function animateBar (value = 1)
{
    const maximum = 50;
    number += value;
    const bar = document.querySelector('.bar'),
          button = document.querySelector('#start'),
          loader = document.querySelector('.loader'),
          wrapper = document.querySelector('.wrapper');
    let procent = Math.floor(number / maximum * 100);
    bar.style.width = procent / 2 + '%';
    // console.log(number + ' => ' + procent + '%');
    if (procent == 100)
    {
        button.addEventListener('click', () =>
        {
            loader.style.display = 'none';
            wrapper.removeAttribute('hidden');
        })
        button.innerText = 'Press me!';
        console.log('Assets loaded.');
    }
}

function checkInputs ()
{
    const button = document.querySelector('button.start'),
          inputs = document.querySelectorAll('input');
    let counter = 0;
    inputs.forEach(input =>
    {
        if (input.value == 0) counter++;
    });
    const value = (counter == inputs.length) ? true : false;
    button.disabled = value;
}

function setClicks ()
{
    const buttons = document.querySelectorAll('button'), numbers = [null, [3], [2, 4], [1, 3, 5]];
    for (let index = 0 ; index < buttons.length ; index++)
    {
        const current_button = buttons[index];
        if (current_button.classList.contains('start'))
        {
            const lefts_army = new Array, rights_army = new Array;
            current_button.addEventListener('click', function()
            {
                let amount, faction, number;
                for (let index = 0; index < buttons.length; index++)
                {
                    let button = buttons[index];
                    button.setAttribute('disabled', true);
                }
                amount = document.getElementsByName('melee')[0].value;
                faction = document.getElementsByName('lefts')[0].value;
                for (let index = 0; index < amount; index++)
                {
                    const number = numbers[amount][index];
                    if (faction == 'Novgorod')
                    {
                        lefts_army.push(new Axeman (1, faction, index, number));
                    }
                    else lefts_army.push(new Warrior (1, faction, index, number));
                }
                amount = document.getElementsByName('range')[0].value;
                for (let index = 0; index < amount; index++)
                {
                    const number = numbers[amount][index];
                    if (faction == 'Novgorod')
                    {
                        lefts_army.push(new Crossbowman (1, faction, index, number));
                    }
                    else lefts_army.push(new Archer (1, faction, index, number));
                }
                amount = document.getElementsByName('melee')[1].value;
                faction = document.getElementsByName('rights')[0].value;
                for (let index = 0; index < amount; index++)
                {
                    const number = numbers[amount][index];
                    if (faction == 'Kiev')
                    {
                        rights_army.push(new Swordsman (2, faction, index, number));
                    }
                    else rights_army.push(new Warrior (2, faction, index, number));
                }
                amount = document.getElementsByName('range')[1].value;
                for (let index = 0; index < amount; index++)
                {
                    const number = numbers[amount][index];
                    if (faction == 'Kiev')
                    {
                        rights_army.push(new Bowman (2, faction, index, number));
                    }
                    else rights_army.push(new Archer (2, faction, index, number));
                }
                arena = new Arena (lefts_army, rights_army);
                audio.playAudio(audio.track_name, 0, 'track');
            }
        )}
        else if (current_button.classList.contains('minus'))
        {
            current_button.addEventListener('click', function()
            {
                let number = Number(this.nextElementSibling.value),
                    minimum = Number(this.nextElementSibling.min);
                if (number > minimum)
                    this.nextElementSibling.value = --number;
                checkInputs();
            }
        )}
        else if (current_button.classList.contains('plus'))
        {
            current_button.addEventListener('click', function()
            {
                let number = Number(this.previousElementSibling.value),
                    maximum = Number(this.previousElementSibling.max);
                if (number < maximum)
                    this.previousElementSibling.value = ++number;
                checkInputs();
            }
        )};
    }
}

const timer = 120, updater = document.getElementById('update');
let arena, number = 0, observer = new MutationObserver
( change =>
    {
        const status = updater.getAttribute('data-change');
        arena.synchronizeBots(status);
    }
);
observer.observe(updater, {attributes: true});
setClicks();