class Audio
{
    context = new (AudioContext || window.webkitAudioContext)();
    playing = true;
    node = null;
    sound = new Object;
    sound_list = ['shoot', 'shoot_shield', 'strike', 'strike_shield'];
    sounds = new Object;
    track = new Object;
    track_name = 'Medieval_Style_Cover_-_Mortal_Kombat_Theme_Song';
    tracks = new Object;
    constructor ()
    {
        this.loadAudio(this.sound_list, 'sounds');
        this.loadAudio([this.track_name], 'tracks');
    }

    async loadAudio (list, type)
    {
        for (let index = 0; index < list.length; index++)
        {
            const link = `${type}/${list[index]}.mp3`,
                  temp = await this.sendRequest(link);
            this[type][list[index]] = await this.context.decodeAudioData(temp);
            if (type == 'sounds') animateBar(1)
            else animateBar(23);
        }
    }

    playAudio (name, timer = 500, type = 'sound')
    {
        let source = this[type] = this.context.createBufferSource();
        if (source.start == undefined) source.start = source.noteOn;
        source.buffer = this[type + 's'][name];
        if (type == 'track')
        {
            this.node = this.context.createGain();
            source.connect(this.node);
            source.onended = () =>
            {
                this.track = null;
                if (this.playing) this.playAudio(this.track_name, 0, 'track');
            }
            this.node.connect(this.context.destination);
        }
        else source.connect(this.context.destination);
        if (type == 'sound') setTimeout(() => source.start(0), timer)
        else source.start(0);
    }

    smoothStopAudio ()
    {
        setTimeout(() => audio.stopAudio(), 10000);
        this.node.gain.cancelScheduledValues(this.context.currentTime);
        this.node.gain.setValueAtTime(this.node.gain.value, this.context.currentTime);
        this.node.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 10);
    }

    stopAudio (type = 'track')
    {
        console.log('stop audio!');
        let source = this[type];
        if (source.stop == undefined) source.stop = this[type].noteOff;
        source.stop();
        source = null;
    }

    async sendRequest (link)
    {
        console.log('Request:', link);
        const response = await fetch(link).then(response => response.arrayBuffer());
        return response;
    }
}
const audio = new Audio;