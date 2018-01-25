import ControlEvents from './events.js';
import VideoEventNames from "../../../constants/video.events.js";
import TrackEventNames from "../../../constants/tracks.events.js";
import TrackCuesEventNames from "../../../constants/tracks.cues.events.js";

export class Controls extends ControlEvents {
    constructor(playerId) {
        super(playerId);

        Object.assign(this, {
            playerId,
            currentVolume: 0.5,
            controlEventNames: new VideoEventNames(),
            trackEventNames: new TrackEventNames(),
            trackCuesEventName: new TrackCuesEventNames()
        })
    }

    dispose(iVXjsBus) {
        iVXjsBus.removeListener(this.controlEventNames.TIME_UPDATE, this.updateTime);
        iVXjsBus.removeListener(this.controlEventNames.PLAYING, this.whilePlaying);
        iVXjsBus.removeListener(this.controlEventNames.CAN_PLAY, this.canPlayCallback);
        iVXjsBus.removeListener(this.controlEventNames.MUTE, this.whileMuted);
        iVXjsBus.removeListener(this.controlEventNames.UNMUTE, this.whileUnmuted);
        iVXjsBus.removeListener(this.controlEventNames.SET_VOLUME, this.whileSetVolume);
        iVXjsBus.removeListener(this.trackCuesEventName.ON_CHAPTER_START, this.chapterChange);
        iVXjsBus.removeListener(this.trackEventNames.CHANGE_CURRENT_TRACK, this.trackChange)
    }

    getAbsolutePosition(element) {
        let relativePosition = { x: element.offsetLeft, y: element.offsetTop };

        if (element.offsetParent) {
            let tempPosition = this.getAbsolutePosition(element.offsetParent);

            relativePosition.x += tempPosition.x;
            relativePosition.y += tempPosition.y;
        }

        return relativePosition;
    }

    adjustVolume(event) {
        let { volumeBar, muteControls, currentVolume, volumeBarCurrentVolumeClasses, unmuteClasses, muteClasses } = this;
        let { offsetWidth: width } = volumeBar;
        let currentVolumeSpan = this.getElementByClasses(volumeBar.children, [volumeBarCurrentVolumeClasses]);
        let absolutePosition = this.getAbsolutePosition(volumeBar);
        let { x: absoluteX } = absolutePosition;
        let { pageX: x } = event;
        let trueX = (x - (absoluteX));
        let volumeLevel = (trueX / width);
        let muteControlsClasses = [muteClasses, unmuteClasses];
        let muteIcon = this.getElementByClasses(muteControls.children, muteControlsClasses);

        muteIcon.className = unmuteClasses;
        currentVolumeSpan.style.width = `${volumeLevel * 100}%`;

        this.currentVolume = volumeLevel;
        this.setVolume(volumeLevel);
    }

    scrub(event) {
        let { currentTimeInfo, scrubBar, scrubBarTimeLapseClasses } = this;
        let { offsetWidth: width } = scrubBar;
        let absolutePosition = this.getAbsolutePosition(scrubBar);
        let { x: absoluteX } = absolutePosition;
        let { pageX: x } = event;
        let trueX = (x - (absoluteX));
        let scrubToTime = this.duration * (trueX / width);
        let currentTimeObject = this.convertSecondsToParts(scrubToTime);
        let currentTimeStamp = this.createTimeStamp(currentTimeObject);
        let searchClasses = [scrubBarTimeLapseClasses]
        let timelapsed = this.getElementByClasses(scrubBar.children, searchClasses);

        currentTimeInfo.innerHTML = `${currentTimeStamp}`;
        timelapsed.style.width = `${(trueX / width) * 100}%`;

        this.seek(scrubToTime);
    }

    togglePlayPause(event) {
        let { playPauseControls, playClasses, pauseClasses } = this;
        let searchClasses = [playClasses, pauseClasses];
        let playPauseIcon = this.getElementByClasses(playPauseControls.children, searchClasses);

        switch (playPauseIcon.className) {
            case playClasses:
                this.setPlay();
                break;
            case pauseClasses:
                this.setPause();
                break;
            default:
                break;
        }
    }

    setPlay() {
        let { playPauseControls, playClasses, pauseClasses } = this;
        let searchClasses = [playClasses, pauseClasses];
        let playPauseIcon = this.getElementByClasses(playPauseControls.children, searchClasses);

        playPauseIcon.className = pauseClasses;
        this.play();
    }

    setPause() {
        let { playPauseControls, playClasses, pauseClasses } = this;
        let searchClasses = [playClasses, pauseClasses];
        let playPauseIcon = this.getElementByClasses(playPauseControls.children, searchClasses);

        playPauseIcon.className = playClasses;
        this.pause();

    }

    toggleMute(event) {
        let { muteControls, muteClasses, unmuteClasses, volumeBar, volumeBarCurrentVolumeClasses } = this;
        let muteControlsClasses = [muteClasses, unmuteClasses];
        let muteIcon = this.getElementByClasses(muteControls.children, muteControlsClasses);
        let currentVolumeSpan = this.getElementByClasses(volumeBar.children, [volumeBarCurrentVolumeClasses]);

        switch (muteIcon.className) {
            case unmuteClasses:
                this.mute();
                break;
            case muteClasses:
                this.unmute();
                break;
            default:
                break;
        }
    }

    mute() {
        let { muteControls, muteClasses, unmuteClasses, volumeBar, volumeBarCurrentVolumeClasses } = this;
        let muteControlsClasses = [muteClasses, unmuteClasses];
        let muteIcon = this.getElementByClasses(muteControls.children, muteControlsClasses);
        let currentVolumeSpan = this.getElementByClasses(volumeBar.children, [volumeBarCurrentVolumeClasses]);

        muteIcon.className = muteClasses;
        currentVolumeSpan.style.width = `0%`;

        this.setVolume(0);
    }

    unmute() {
        let { muteControls, muteClasses, unmuteClasses, volumeBar, volumeBarCurrentVolumeClasses } = this;
        let muteControlsClasses = [muteClasses, unmuteClasses];
        let muteIcon = this.getElementByClasses(muteControls.children, muteControlsClasses);
        let currentVolumeSpan = this.getElementByClasses(volumeBar.children, [volumeBarCurrentVolumeClasses]);

        muteIcon.className = unmuteClasses;
        currentVolumeSpan.style.width = `${this.currentVolume * 100}%`;

        this.setVolume(this.currentVolume);
    }

    setVolumeBar(volume) {
        let { muteControls, muteClasses, unmuteClasses, volumeBar, volumeBarCurrentVolumeClasses } = this;
        let muteControlsClasses = [muteClasses, unmuteClasses];
        let muteIcon = this.getElementByClasses(muteControls.children, muteControlsClasses);
        let currentVolumeSpan = this.getElementByClasses(volumeBar.children, [volumeBarCurrentVolumeClasses]);

        if (volume) this.currentVolume = volume;

        currentVolumeSpan.style.width = `${volume * 100}%`;
    }

    onReadyToPlay(player) {
        let { volumeBar, volumeBarCurrentVolumeClasses } = this;
        let self = this;
        let currentVolumeSpan = this.getElementByClasses(volumeBar.children, [volumeBarCurrentVolumeClasses]);

        if (currentVolumeSpan) {
            currentVolumeSpan.style.width = `${self.currentVolume * 100}%`;
        }

        this.setVolume(self.currentVolume);
        this.getDuration((duration) => {
            let { totalTimeInfo, currentTimeInfo, scrubBar } = self;
            let durationTimeObject = self.convertSecondsToParts(duration);
            let durationTimeStamp = self.createTimeStamp(durationTimeObject);

            self.duration = duration;

            if (totalTimeInfo) totalTimeInfo.innerHTML = `/${durationTimeStamp}`;
            if (currentTimeInfo) currentTimeInfo.innerHTML = `00:00`;
            if (scrubBar) scrubBar.children[0].style.width = `0%`;
        });
    }

    onTimeUpdate(player) {
        let { currentTimeInfo, scrubBar, scrubBarTimeLapseClasses } = this;
        let { currentTime: seconds } = player;

        seconds = seconds > this.duration ? 0 : seconds;

        let currentTimeObject = this.convertSecondsToParts(seconds);
        let currentTimeStamp = this.createTimeStamp(currentTimeObject);
        let timeLapsed = seconds / this.duration;

        if (currentTimeInfo) currentTimeInfo.innerHTML = `${currentTimeStamp}`;

        let searchClasses = [scrubBarTimeLapseClasses];

        if (scrubBar) {
            let timelapsedElement = this.getElementByClasses(scrubBar.children, searchClasses);

            timelapsedElement.style.width = `${timeLapsed * 100}%`;
        }
    }

    onPlaying() {
        let { playPauseControls, playClasses, pauseClasses } = this;
        let searchClasses = [playClasses, pauseClasses]
        let playPauseIcon = this.getElementByClasses(
            playPauseControls.children,
            searchClasses
        );

        playPauseIcon.className = pauseClasses;
    }

    onPaused() {
        let { playPauseControls, playClasses, pauseClasses } = this;
        let searchClasses = [playClasses, pauseClasses]
        let playPauseIcon = this.getElementByClasses(
            playPauseControls.children,
            searchClasses
        );

        playPauseIcon.className = playClasses;
    }

    addEventListeners(iVXjsBus) {
        let self = this;
        let { scrubBar, volumeBar, playPauseControls, muteControls, trackCuesEventName } = this;

        this.iVXjsBus = iVXjsBus;
        this.updateTime = iVXjsBus.on(this.controlEventNames.TIME_UPDATE, player => {
            updateTime(player);
        });
        this.whilePaused = iVXjsBus.on(this.controlEventNames.PAUSED, whilePaused);
        this.whilePlaying = iVXjsBus.on(this.controlEventNames.PLAYING, whilePlaying);
        this.canPlayCallback = iVXjsBus.on(this.controlEventNames.CAN_PLAY, canPlayCallBack);
        this.whileMuted = iVXjsBus.on(this.controlEventNames.MUTE, mute);
        this.whileUnmuted = iVXjsBus.on(this.controlEventNames.UNMUTE, unmute);
        this.whileSetVolume = iVXjsBus.on(this.controlEventNames.SET_VOLUME, setVolume);
        this.chapterChange = iVXjsBus.on(this.trackCuesEventName.ON_CHAPTER_START, chapterChange);
        this.trackChange = iVXjsBus.on(this.trackEventNames.CHANGE_CURRENT_TRACK, trackChange)
        this.updateTime = this.updateTime ? this.updateTime : updateTime;

        volumeBar.addEventListener('mousedown', (event) => {
            self.adjustVolume(event);
        });
        scrubBar.addEventListener('click', (event) => {
            self.scrub(event);
        });
        playPauseControls.addEventListener('mouseup', (event) => {
            self.togglePlayPause(event);
        });
        muteControls.addEventListener('click', (event) => {
            self.toggleMute(event);
        });

        const canPlayListener = this.iVXjsBus.on(this.controlEventNames.CAN_PLAY, (player) => {
            if (player.id === self.playerId) {
                self.createPlayerSpecificControls({ player })
                self.player = player;
                self.iVXjsBus.removeListener(this.controlEventNames.CAN_PLAY, canPlayListener);
            }

        });

        function chapterChange(args = {}) {
            const { cue, playerId } = args;

            if (!playerId || playerId === self.playerId) changeChapter();
            if (playerId === self.playerId) changeChapter();

            function changeChapter() {
                const { chapterActiveClasses, chapterListItemClasses, chapterInActiveClasses } = self;
                const chapterListContainer = document.getElementById(`${self.playerId}-chapter-list`);
                const { chapterId: currentChapterId } = cue;

                if (!chapterListContainer) return;

                const chapterList = Array.from(chapterListContainer.children);

                chapterList.forEach(chapterListItem => {
                    let { id: chapterId } = chapterListItem;

                    if (chapterId.indexOf(currentChapterId) >= 0) {
                        chapterListItem.classList.remove(chapterInActiveClasses);
                        chapterListItem.classList.add(chapterActiveClasses);
                        return;
                    }

                    chapterListItem.classList.remove(chapterActiveClasses);
                    chapterListItem.classList.add(chapterInActiveClasses);
                });
            }
        };

        function trackChange(opts) {
            let { trackId = "", playerId } = opts;

            if (playerId === self.playerId) {
                self.updateTrackSelector(trackId)
            }
        }

        function canPlayCallBack(player) {
            if (player.id === self.playerId) {
                self.onReadyToPlay(player);
            }
        }

        function updateTime(player) {
            if (player.id === self.playerId) {
                self.onTimeUpdate(player);
            }
        }

        function whilePaused(player) {
            if (player.id === self.playerId) {
                self.onPaused(player);
            }
        }

        function whilePlaying(player) {
            if (player.id === self.playerId) {
                self.onPlaying();
            }
        }

        function mute(args = {}) {
            const { playerId } = args;

            if (!playerId || playerId === self.playerId) self.mute();
        }

        function unmute(args) {
            const { playerId } = args;

            if (!playerId || playerId === self.playerId) self.unmute();
        }

        function setVolume(args) {
            const { playerId, volume } = args;

            if (!playerId || playerId === self.playerId) self.setVolumeBar(volume);
        }
    }

    getElementByClasses(elements, classes) {
        let elementArray = elements instanceof Array ?
            elements :
            Array.from(elements);
        let thisElement;

        classes.forEach((className, index) => {
            if (!className) return;
            if (thisElement) return;

            thisElement = elementArray.find((element, index) => {
                return element.className.indexOf(className) >= 0;
            })
        });

        return thisElement;
    }

    createTimeStamp(timeObject) {
        let { hours, remainingMinutes: minutes, remainingSeconds: seconds } = timeObject;
        let hourString = '';
        let minuteString = minutes < 10 ?
            `0${minutes}:` :
            `${minutes}:`;
        let secondString = seconds < 10 ?
            `0${seconds}` :
            `${seconds}`;

        if (hours > 0) {
            hourString = hours < 10 ?
                `0${hours}:` :
                `${hours}:`;
        };

        return `${hourString}${minuteString}${secondString}`;
    }

    convertSecondsToParts(seconds) {
        let minutes = Math.floor(seconds / 60);
        let timeInformation = {
            minutes: minutes,
            hours: Math.floor(minutes / 60),
            remainingSeconds: Math.floor(seconds % 60),
            remainingMinutes: Math.floor(minutes % 60),
            seconds: seconds
        }

        return timeInformation;
    }
};