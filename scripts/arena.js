class Arena
{
    constructor ( side_1, side_2 )
    {
        this.buffer = [null, '-', '-']; // round damage, left bot id, right bot id
        this.side_1 = side_1;
        this.placeBots(this.side_1, 'lefts');
        this.side_2 = side_2;
        this.placeBots(this.side_2, 'rights');
        this.synchronizeBots();
    }
    
    combat ( bot_1, bot_2, side ) // may be change 'id 'to 'frame_id'?
    {
        const assaulters = this[`side_${1 + side}`],
              defenders = this[`side_${2 - side}`];
        let attack, bot_1_line, bots_1, bot_2_line, bots_2, damage, defense,
            buffer = this.buffer;
        // start battle between bot №1 and bot №2:
        bot_1.action = 'attack';
        bot_1.counter += 1;
        bot_1.status = 'attacking';
        bot_2.status = 'defending';
        bot_1_line = bot_1.placement.toString()[1];
        bot_2_line = bot_2.placement.toString()[1];
        console.log('Lines:', bot_1_line, bot_2_line);
        console.log('buffers:', buffer[1], buffer[2]);
        if (bot_1_line == bot_2_line)
        {
            bot_1.rotate = bot_2.rotate = 0;
            updater.nextElementSibling.innerText = `The combatants didn't turn`;
        }
        else if (bot_1.army == 1 && bot_1_line > bot_2_line || bot_1.army == 2 && bot_1_line < bot_2_line)
        {
            bot_1.rotate = bot_2.rotate = +1;
            updater.nextElementSibling.innerText = 'The combatants turn to the left';
        }
        else if (bot_1.army == 1 && bot_1_line < bot_2_line || bot_1.army == 2 && bot_1_line > bot_2_line)
        {
            bot_1.rotate = bot_2.rotate = -1;
            updater.nextElementSibling.innerText = 'The combatants turn to the right';
        }
        console.log('Turns:', bot_1.rotate, bot_2.rotate);
        var text = `${bot_1.faction} ${bot_1.type} №${bot_1.index} (${bot_1.health}hp) attacks ` 
                  + `${bot_2.faction} ${bot_2.type} №${bot_2.index} (${bot_2.health}hp)`;
        console.log(text); updater.firstElementChild.innerText = text;
        console.log(`attack №${bot_1.counter} ` + `(current bot: №${bot_1.id}, previous bot: №${this.buffer[1]})`);
        // check factors & modifiers:
        buffer[0] = damage = bot_1.weapon.generateDamage();
        if (bot_1.role == 'range') audio.playAudio('shoot', 1250);
        if (bot_2.shield)
        {
            defense = bot_2.shield.blockDamage();
            attack = this.randomizator(1, 100);
            if (attack < defense)
            {
                bot_2.action = 'defense';
                damage = null;
                switch (bot_1.role)
                {
                    case 'melee':
                        audio.playAudio('strike_shield', 1000);
                    break;
                    case 'range':
                        audio.playAudio('shoot_shield', 1750);
                    break;
                }
                var text = `${bot_2.faction} ${bot_2.type} blocks attack`;
                console.log(text);
                updater.lastElementChild.innerText = text;
            }
            else if (bot_1.role == 'melee') audio.playAudio('strike', 750);
        }
        else if (bot_1.role == 'melee') audio.playAudio('strike', 600);
        if (bot_2.armor && damage)
        {
            defense = bot_2.armor.reduceDamage();
            damage = Math.round(damage * defense);
            var text = `Armor reduces damage by ${Math.round(100-defense*100)}% ` + `from ${buffer[0]}hp to ${damage}hp`;
            console.log(text);
            updater.lastElementChild.innerText = text;
        }
        if (damage)
        {
            bot_2.health -= damage;
            console.log(`${bot_1.faction} ${bot_1.type} deals ${damage}dp`);
            console.log(`${bot_2.faction} ${bot_2.type} has ${bot_2.health}hp left`);
            if (bot_2.health <= 0)
            {
                setTimeout
                (() => {
                    bot_2.action = 'death';
                    bot_2.animation = false;
                }, timer/2);
                const input = document.getElementsByName(bot_2.role)[bot_2.army-1].value -= 1;
                var text = `${bot_2.faction} ${bot_2.type} was killed`;
                console.log(text);
                updater.firstElementChild.innerText = text;
                let index = defenders.indexOf(bot_2);
                defenders.splice(index, 1);
            }
        }
        bots_1 = assaulters.find(bot => bot.role == 'melee');
        bots_2 = defenders.find(bot => bot.role == 'melee');
        if (bots_1 && !bots_2 && defenders.length)
        {
            defenders.forEach
            ( bot => {
                if (bot.role == 'range')
                {
                    bot.retreat = true;
                    console.log(`${bot.faction} ${bot.type} (${bot.health}hp) retreats`);
                }
            });
        }
        if (!bots_1 && !bots_2 && defenders.length || bots_2)
        {
            buffer[1] = bot_1.id;
            buffer[2] = bot_2.id;
        }
        else
        {
            assaulters.forEach(bot => bot.animation = false);
            audio.playing = false;
            audio.smoothStopAudio();
            var text = `${bot_1.faction} wins!`
            console.log(text);
            setTimeout(() => location.reload(), 15000);
            updater.lastElementChild.innerText = text;
            updater.nextElementSibling.innerText = '';
        }
    }
    
    synchronizeBots ( status = null )
    {
        const requirement = this.side_1.length + this.side_2.length;
        if (status == null)
        {
            this.side_1.forEach(bot => bot.ready ? status += true : status += false);
            this.side_2.forEach(bot => bot.ready ? status += true : status += false);
        }
        if (status == requirement)
        {
            console.log('run synchronization');
            updater.setAttribute('data-change', 0);
            this.side_1.forEach(bot => bot.animateBot(bot));
            this.side_2.forEach(bot => bot.animateBot(bot));
            this.selectBots();
        }
        else return;
    }
    
    placeBots ( bots, side )
    {
        console.log(side, bots);
        let amount = bots.length;
        for (let index = 0; index < amount; index++)
        {
            let bot = bots[index],
                frame = document.createElement('div'),
                frame_id = bot.id = bot.army * 100 + (index + 1),
                line = document.createElement('div'),
                parent = document.getElementById(side);
            frame.classList.add('sprite');
            frame.setAttribute('id', frame_id);
            line.classList.add('line');
            line.classList.add(`line-${side}`);
            parent = parent.querySelector(`.${bot.role}`);
            parent.appendChild(frame);
            frame.appendChild(line);
        }
    }
    
    selectBots ( side_1 = this.side_1, side_2 = this.side_2 )
    {
        let amount, number, side;
        // select side for attack:
        side = this.randomizator(0, 1);
        const assaulters = this[`side_${1 + side}`],
              defenders = this[`side_${2 - side}`];
        // select assaulter (bot №1):
        amount = assaulters.length;
        number = this.randomizator(1, amount);
        let bot_1 = assaulters[number - 1];
        if (bot_1.id == this.buffer[1])
        {
            if (bot_1.counter == 0 || bot_1.counter == bot_1.skill)
            {
                console.log(`ReSelect => (limit): ${bot_1.type}(№${bot_1.id})`);
                bot_1.counter = 0;
                this.selectBots();
                return;
            }
        }
        else bot_1.counter = 0;
        // select defender (bot №2):
        amount = defenders.length;
        number = this.randomizator(1, amount);
        let bot_2 = defenders[number - 1];
        if (bot_1.role == 'melee' && bot_2.role != 'melee')
        {
            console.log(`ReSelect => (melee): ${bot_1.type}, (range): ${bot_2.type}`);
            this.selectBots();
            return;
        }
        // start combat between bots:
        console.log(bot_1, 'vs', bot_2);
        this.combat(bot_1, bot_2, side);
    }
    
    randomizator ( min, max )
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}