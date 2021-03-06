import createFactoryFunction from '../utilities/create-factory-function.js';
import VimeoVideoPlayerController from '../controllers/video.vimeo.js';



class VimeoVideoPlayer {
    constructor($rootScope, $compile, $window, $timeout, iVXjsBus, iVXjsLog, iVXjsVideoModule, createInlineVideo, iVXjsVideoService, ivxExperienceScope, pullInTemplate, iVXjsActions) {
        this.template = this.templateHTML;
        this.restrict = 'E';
        this.replace = true;
        this.scope = {
            playerId: "@playerId",
            settings: "=settings",
            stateData: "=stateData"
        }
        this.controller = VimeoVideoPlayerController
        this.controllerAs = 'vm';
        this.link = ($scope, iElm, iAttrs, controller) => {
            if (!iVXjsVideoModule.vimeo) return;

            let { settings = {}, stateData: passedStateData = {}, playerId } = $scope;

            const stateData = Object.assign({}, passedStateData);
            const { personalizations = [] } = stateData;

            let personalizationsHTML = personalizations.reduce((personalizationHTML, thisPersonalization, index) => {
                thisPersonalization = pullInTemplate.convertTemplateUrlToHtml(thisPersonalization, $scope);

                let { defaultAnimationClass = 'hide', html, id } = thisPersonalization;

                return `${personalizationHTML} <div id="${id}" class="${defaultAnimationClass} ivx-video-personalization-container ">${html}</div> `
            }, "");

            $scope = ivxExperienceScope.setScopeExperience($scope);


            const playerSettings = Object.assign({},
                settings, {
                    playerId,
                    personalizationsHTML,
                    id: settings.vimeoId
                });

            if (stateData.cuePoints) {
                playerSettings.cuePoints = stateData.cuePoints;
            }


            let VimeoPlayer = new iVXjsVideoModule.vimeo(iElm.find('div')[0], playerSettings, stateData, iVXjsLog, {
                vimeoPlayerContainer: iElm[0]
            });

            VimeoPlayer.addEventListeners(iVXjsBus, playerSettings, iVXjsActions);

            controller.player = VimeoPlayer;

            $compile(iElm.contents())($scope);

            iVXjsVideoService.createCuePointListener(playerId, playerSettings.cuePoints);

            $scope.$on('$destroy', () => {
                VimeoPlayer.dispose(iVXjsBus);
                iVXjsVideoService.createCuePointListener
            })
        }
    }

    get templateHTML() {
        return `
            <div class="vimeo-player-container">
                <div></div>
            </div>`;
    }
}

VimeoVideoPlayer.$inject = ['$rootScope', '$compile', '$window', '$timeout', 'ivxjs.bus', 'ivxjs.log', 'ivxjs.modules.video', 'createInlineVideo', 'iVXjsVideoService', 'ivxExperienceScope', 'pullInTemplate', 'iVXjsActions'];

export default angular
    .module('ivx-js.directives.video.vimeo', [])
    .directive('ivxjsVimeoVideoPlayer', createFactoryFunction(VimeoVideoPlayer))
    .name;
