class AutoBot
{
    constructor ( army, faction, index, number )
    {
        this.action = 'stand';
        this.animation = true;
        this.armor = null;
        this.army = army;
        this.counter = 0;
        this.faction = faction;
        this.frame = null;
        this.health = 50;
        this.id = null;
        this.index = ++index;
        this.placement = number;
        this.ready = true;
        this.retreat = false;
        this.rotate = 0;
        this.shield = null;
        this.skill = 1;
        this.status = 'waiting';
        this.timer = 120;
        this.type = 'peasant';
    }
    
    animateBot ( bot )
    {
        bot.frame = 1,
        bot.ready = false;
        let x = bot.x,
            y = bot.y;
        const frame = document.getElementById(bot.id),
              line = frame.querySelector('.line');
        const animation = function()
        {
            const number = +bot.placement.toString()[1] + 1;
            setTimeout(() =>
            {
                if (bot.action == 'death')
                {
                    line.style.width = 0;
                }
                if (bot.retreat)
                {
                    bot.action = 'move';
                    y = (bot.army == 1) ? (bot.melee ? 720 : 830) : (bot.melee ? 320 : 370);
                }
                else if (bot.rotate == 0) // No turn
                {
                    y = bot.position;
                    if (bot.frame == 1 && bot.status != 'waiting') console.log(`${bot.faction} ${bot.type} don't turns.`);
                }
                else if (bot.rotate < 0) // Turn right
                {
                    y = bot.position - bot.increment;
                    if (bot.frame == 1 && bot.status != 'waiting') console.log(`${bot.faction} ${bot.type} turns right.`);
                }
                else if (bot.rotate > 0) // Turn left
                {
                    const maximum = bot.role == 'melee' ? 720 : 830, minimum = bot.role == 'melee' ? 20 : 25;
                    y = bot.position + bot.increment;
                    if (y > maximum) y = minimum;
                    if (bot.frame == 1 && bot.status != 'waiting') console.log(`${bot.faction} ${bot.type} turns left.`);
                }
                render();
                if (bot.frame == 15)
                {
                    if (bot.status == 'attacking' || bot.status == 'defending')
                    {
                        bot.action = 'stand';
                        bot.rotate = 0;
                        bot.status = 'waiting';
                    }
                    if (bot.animation)
                    {
                        bot.ready = true;
                        line.style.width = bot.health / 100 * 20 + 'px';
                        let count = Number(updater.getAttribute('data-change'));
                        count++;
                        updater.setAttribute('data-change', count);
                    }
                }
                else
                {
                    bot.frame += 1;
                    if (bot.action != 'defense' || bot.action == 'defense' && bot.frame <= 10)
                    {
                        x += bot.increment;
                    }
                    requestAnimationFrame(animation);
                };
                function render()
                {
                    bot.y = y;
                    frame.style.backgroundImage = `url(images/${bot.faction}_${bot.type}_${bot.action}.png)`;
                    frame.style.backgroundPosition = `-${x}px -${y}px`;
                    // console.log(`№${bot.id} => ${bot.action} (frame: ${bot.frame})`);
                }
            }, bot.timer);
        }
        requestAnimationFrame(animation);
    }
}

class Archer extends AutoBot
{
    constructor ( army, faction, index, number )
    {
        super(army, faction, index, number);
        this.health *=2;
        this.increment = 115;
        this.placement += 20;
        this.role = 'range';
        this.type = 'bowman';
        this.weapon = new Bow();
        if (this.army == 1) {this.position = this.y = 370};
        if (this.army == 2) {this.position = this.y = 830};
        if (this.army == 1) {this.x = 10};
        if (this.army == 2) {this.x = 25};
    }
}

class Crossbowman extends Archer // Novgorod's unit
{
    constructor ( army, faction, index, number )
    {
        super(army, faction, index, number);
        this.armor = new Armor(1);
        // this.timer = 120;
        this.type = 'crossbowman';
        this.weapon = new Crossbow();
    }
}

class Bowman extends Archer // Kiev's unit
{
    constructor ( army, faction, index, number )
    {
        super(army, faction, index, number);
        this.armor = new Armor(1);
        this.skill = 2;
    }
}

class Warrior extends AutoBot
{
    constructor ( army, faction, index, number )
    {
        super(army, faction, index, number);
        this.health *=2;
        this.increment = 100;
        this.placement += 10;
        this.role = 'melee';
        this.shield = new Shield(1);
        this.type = 'swordsman';
        this.weapon = new Sword();
        this.y = this.position;
        if (this.army == 1) {this.x = 5};
        if (this.army == 2) {this.x = 20};
        if (this.army == 1) {this.position = this.y = 320};
        if (this.army == 2) {this.position = this.y = 720};
    }        
}

class Axeman extends Warrior // Novgorod's unit
{
    constructor ( army, faction, index, number )
    {
        super(army, faction, index, number);
        this.armor = new Armor(2);
        this.shield = null;
        this.skill = 2;
        this.type = 'axeman';
        this.weapon = new Axe();
    }
}

class Swordsman extends Warrior // Kiev's unit
{
    constructor ( army, faction, index, number )
    {
        super(army, faction, index, number);
        this.armor = new Armor(2);
        this.shield = new Shield(2);
        this.skill = 2;
    }
}

class Armor
{
    constructor ( value )
    {
        this.max = 25 * value;
    }
    
    reduceDamage ( max = this.max )
    {
        return (100 - Math.floor(Math.random() * (max + 1))) / 100;
    }
}

class Shield
{
    constructor ( value )
    {
        this.max = 25 * value;
        this.min = 5 * value;
    }
    
    blockDamage ( max = this.max, min = this.min )
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

class Weapon
{
    constructor ()
    {
        this.damage = [0, 0];
        this.melee = false;
        this.range = false;
    }
    
    generateDamage ( array = this.damage )
    {
        let min = array[0],
            max = array[1];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

class Axe extends Weapon
{
    constructor ()
    {
        super();
        this.damage = [15, 30];
        this.melee = true;
    }
}

class Bow extends Weapon
{
    constructor ()
    {
        super();
        this.damage = [5, 15];
        this.range = true;
    }
}

class Crossbow extends Weapon
{
    constructor ()
    {
        super();
        this.damage = [10, 20];
        this.melee = true;
        this.range = true;
    }
}

class Sword extends Weapon
{
    constructor ()
    {
        super();
        this.damage = [10, 20];
        this.melee = true;
    }
}