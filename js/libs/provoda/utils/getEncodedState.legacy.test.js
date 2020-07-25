
var test = require('ava')
var requirejs = require('requirejs');
require('./require-config')

var list = getList()

var getParsedState = requirejs('./getParsedState')
var asString = requirejs('./multiPath/asString')
var fromLegacy = requirejs('./multiPath/fromLegacy')
var modernAsLegacyParsed = requirejs('./modernAsLegacyParsed')



test('modern can be converted and used as legacy', function(t) {
  'use strict'

  var toModernString = function(legacyAddr) {
    var modernParsed = fromLegacy(legacyAddr)
    var modernAddr = asString(modernParsed)
    return modernAddr
  }

  var clean = function(src) {
    var str = JSON.stringify(src)
    return JSON.parse(str)
  }

  list.forEach(function(legacyAddr) {
    var legacyParsed = getParsedState(legacyAddr)
    var legacyParsedFromModern = modernAsLegacyParsed(toModernString(legacyAddr))

    t.deepEqual(
      Object.assign({}, clean(legacyParsed), {full_name: null, zip_name: null}),
      Object.assign({}, clean(legacyParsedFromModern), {full_name: null, zip_name: null})
    )
  })

})


function getList() {
  'use strict'
  return  [].concat(
    [
      "^auth_token"
    ],
    [
      "@one:bestIconToShow:recipe",
      "@one:hasTeamId:recipe",
      "@one:name:recipe",
      "@one:isRecommendedApp:recipe",
      "@one:serviceURL:recipe",
      "#appSettings",
      "#v2HasAuth",
      "#currentTime2Sec",
      "#supportsImporting",
      "@every:config:allRecipes",
      "@matchingCombo:allRecipes",
      "#v2HasAuth",
      "@setupInfo:apps"
    ],
    [
      "^hostname"
    ],
    [
      "^integrationPackages",
      "^integrationPackages",
      "^query"
    ],
    [
      "^requestedAt1Min",
      "^navigationNeededAt",
      "^query",
      "@one:nav_title:service"
    ],
    [
      "@one:current_md_id:map",
      "@one:_provoda_id:pioneer"
    ],
    [
      "@one:needsGlobalSearch:current_mp_md",
      "#appInfo.version",
      "#appInfo.browserVersion"
    ],
    [
      "@one:_provoda_id:current_md",
      "@one:nav_item_removed:current_md",
      "@one:_provoda_id:current_md",
      "^popupClosedAt"
    ],
    [
      "@one:hasEssentialToRun:pioneer"
    ],
    [
      "@one:current_md_id:map",
      "@one:_provoda_id:pioneer"
    ],
    [
      "^initedTime",
      "#currentTime2Sec",
      "#currentTime1Min",
      "@navigationAreLoading:siteCombos",
      "@hostnameToSearch:operableServices",
      "@all:navigationLoadCompleted:siteCombos",
      "@recipeCombo:operableServices",
      "@recipeCombo:allRecipes",
      "@integrationPackage:siteCombos"
    ],
    [
      "@one:isLoading:recipeNavigation",
      "@one:attemptedLoad:recipeNavigation",
      "@one:combined:recipeNavigation",
      "^navigationNeededAt"
    ],
    [
      "^hostname",
      "^customText",
      "^queryCriteria"
    ],
    [
      "@one:isActive:workspace",
      "@one:name:workspace",
      "^isActiveOnTaskbar",
      "^creationSynced",
      "^pinnedByWorkspace",
      "^parentRemoteId"
    ],
    [
      "@one:uuid:current_team",
      "#appSettings",
      "@one:$meta$states$uuid$load_attempted:current_team",
      "@one:selectionData:partitions",
      "@updateUnrequested:runtimeRecipes",
      "@one:items-list$has_any:workspaces",
      "@one:items-list$loading:workspaces",
      "#currentTime2Sec",
      "@one:appsReady:onboarding",
      "@one:setupList:onboarding",
      "@every:readyToBeAnalyzed:workspaces.items-list",
      "@one:servicesLightReady:workspaces.items-list"
    ],
    [
      "@one:isCurrentUser:user",
      "^auth_token",
      "^uuid",
      "^lastOnlineAt",
      "^^_api_used_team-pushes"
    ],
    [
      "^^tabDragging"
    ],
    [
      "^auth_token"
    ],
    [
      "^auth_token",
      "#__requested_ws",
      "^_api_used_user-pushes"
    ],
    [
      "^auth_token"
    ],
    [
      "^auth_token"
    ],
    [
      "#isMac",
      "^^focusRequestedAt"
    ],
    [
      "^auth_token",
      "@one:teamId:currentUser",
      "@one:isLoading:teamApps",
      "@one:recipesLength:teamApps",
      "@one:recipesLoaded:teamApps"
    ],
    [
      "^auth"
    ],
    [
      "^vmp_show",
      "^mp_show_end"
    ],
    [
      "^nav_clickable"
    ],
    [
      "^vmp_show",
      "^mp_show_end"
    ],
    [
      "@one:email:user",
      "@one:userId:user",
      "@one:name:user",
      "@one:avatar:user"
    ],
    [
      "^auth_token"
    ],
    [
      "#locales.at-this-page",
      "#locales.ask-rating-help"
    ],
    [
      "^nav_clickable"
    ],
    [
      "#currentTime1Min"
    ],
    [
      "#currentTime2Sec",
      "^remoteId",
      "@one:config:recipe",
      "@one:config:recipePreview",
      "@one:config__loading:recipe",
      "@one:updating:recipe",
      "#showMessageBadges",
      "@one:version:recipe",
      "^^^appSettings",
      "^^^isAppMuted",
      "@one:config:recipePreview",
      "@one:name:recipePreview",
      "@one:hasTeamId:recipe",
      "@one:welcomeURL:recipe",
      "@one:hasCustomUrl:recipe",
      "@one:serviceURL:recipe",
      "@one:name:recipe",
      "@one:config:recipePreview",
      "@one:teamIdLabel:recipe",
      "@one:serviceURL:recipe",
      "@one:hasTeamId:recipe",
      "@one:buildUrl:recipe",
      "@one:icons:recipe",
      "@one:icons:recipe",
      "@one:hasCustomUrl:recipe",
      "@one:userAgent:recipe",
      "^partitionId",
      "@one:path:recipe",
      "@one:infoForForm:recipe",
      "^isActive",
      "@one:existing:badgeScrapper",
      "@one:wantedToRun:activeContext",
      "#features",
      "@one:isPinned:activeContext",
      "^isActive",
      "#menuOpen",
      "#mainWindowIsActive",
      "@one:removed:currentTab",
      "@one:available:currentAlert",
      "#features"
    ],
    [
      "^^^^appSettings"
    ],
    [
      "^vmp_show",
      "^mp_show_end"
    ],
    [
      "@one:appSettings:globalSettings",
      "@one:v2AuthToken:start_page.current_app_user",
      "@one:privacySettings:start_page.current_app_user",
      "@one:supportUnreadMessageCount:start_page.current_app_user",
      "@one:isLoadingToken:start_page.current_app_user",
      "@one:isLoadingWorkspaces:start_page.current_app_user",
      "@one:keys:start_page.current_app_user.features",
      "@one:tabIdentificationInfo:start_page.current_app_user",
      "@some:activeFullScreen:start_page.tabs.list"
    ],
    [
      "#locales.at-this-page",
      "#locales.ask-rating-help"
    ],
    [
      "^nav_clickable"
    ],
    [
      "#features",
      "#v2HasAuth",
      "^activeIds",
      "#servicesTabs",
      "@one:recipeId:service",
      "#tabIdentificationInfo",
      "#sidekickFeatures",
      "#tabIdentificationInfo",
      "#sidekickFeatures",
      "@one:relatedTabCombo:service",
      "@one:hasBadgeScrapper:service",
      "@one:hasCredentials:service",
      "@one:useMobileAgent:service",
      "@one:hostnameToSearch:service"
    ],
    [
      "#sidekickFeatures"
    ],
    [
      "#recipesOutdatedVersions",
      "#wantedRecipeUpdates"
    ],
    [
      "^^partitionsData",
      "^selectedToActivateWSId",
      "^auth_token",
      "#__requested_ws",
      "@every:readyToBeAnalyzed:services-list",
      "^_api_used_user-pushes",
      "@unreadDirectMessageCount:services-list",
      "@unreadIndirectMessageCount:services-list",
      "@displayName:services-list",
      "#machineMemoryGB",
      "@remoteId:services-list"
    ],
    [
      "^recipeId",
      "^hostnameToSearch",
      "^query",
      "@one:$meta$nests$itemsList$length:results",
      "@one:isLoading:recipeNavigation",
      "@one:attemptedLoad:recipeNavigation",
      "@one:$meta$nests$freshItemsList$loading:results",
      "@one:combined:recipeNavigation",
      "^relatedHistoryRequestedAt"
    ],
    [
      "#haveWindows"
    ],
    [
      "#appSettings"
    ],
    [
      "^auth_token",
      "@every:readyToBeAnalyzed:items-list",
      "@one:remoteId:lastActiveWS",
      "#__requested_ws",
      "@services-list$exists:items-list",
      "^_api_used_user-pushes",
      "#machineMemoryGB",
      "@remoteId:items-list",
      "#unrelatedTabActivationHappendAt"
    ],
    [
      "^popupSize"
    ],
    [
      "^nav_title",
      "^nav_title_full",
      "^remoteId",
      "^^selectedToActivateServiceId",
      "^auth_token",
      "@one:hasPasswordMasterKey:currentAppUser",
      "^_api_used_user-pushes",
      "^isActive",
      "^name"
    ]
  )
}
