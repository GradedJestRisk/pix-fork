## Modules

<dl>
<dt><a href="#module_CampaignApi">CampaignApi</a></dt>
<dd></dd>
<dt><a href="#module_OrganizationLearnerApi">OrganizationLearnerApi</a></dt>
<dd></dd>
<dt><a href="#module_OrganizationLearnerWithParticipationsApi">OrganizationLearnerWithParticipationsApi</a></dt>
<dd></dd>
<dt><a href="#module_TargetProfileApi">TargetProfileApi</a></dt>
<dd></dd>
</dl>

<a name="module_CampaignApi"></a>

## CampaignApi

* [CampaignApi](#module_CampaignApi)
    * [~save(campaign)](#module_CampaignApi..save) ⇒ <code>Promise.&lt;SavedCampaign&gt;</code>
    * [~get(campaignId)](#module_CampaignApi..get) ⇒ <code>Promise.&lt;Campaign&gt;</code>
    * [~update(payload)](#module_CampaignApi..update) ⇒ <code>Promise.&lt;Campaign&gt;</code>
    * [~findAllForOrganization(payload)](#module_CampaignApi..findAllForOrganization) ⇒ <code>Promise.&lt;CampaignListResponse&gt;</code>
    * [~CampaignPayload](#module_CampaignApi..CampaignPayload) : <code>object</code>
    * [~UserNotAuthorizedToCreateCampaignError](#module_CampaignApi..UserNotAuthorizedToCreateCampaignError) : <code>object</code>
    * [~UpdateCampaignPayload](#module_CampaignApi..UpdateCampaignPayload) : <code>object</code>
    * [~PageDefinition](#module_CampaignApi..PageDefinition) : <code>object</code>
    * [~CampaignListPayload](#module_CampaignApi..CampaignListPayload) : <code>object</code>
    * [~Pagination](#module_CampaignApi..Pagination) : <code>object</code>
    * [~CampaignListResponse](#module_CampaignApi..CampaignListResponse) : <code>object</code>

<a name="module_CampaignApi..save"></a>

### CampaignApi~save(campaign) ⇒ <code>Promise.&lt;SavedCampaign&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  
**Throws**:

- <code>UserNotAuthorizedToCreateCampaignError</code> to be improved to handle different error types


| Param | Type |
| --- | --- |
| campaign | <code>CampaignPayload</code> | 

<a name="module_CampaignApi..get"></a>

### CampaignApi~get(campaignId) ⇒ <code>Promise.&lt;Campaign&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| campaignId | <code>number</code> | 

<a name="module_CampaignApi..update"></a>

### CampaignApi~update(payload) ⇒ <code>Promise.&lt;Campaign&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| payload | <code>UpdateCampaignPayload</code> | 

<a name="module_CampaignApi..findAllForOrganization"></a>

### CampaignApi~findAllForOrganization(payload) ⇒ <code>Promise.&lt;CampaignListResponse&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| payload | <code>CampaignListPayload</code> | 

<a name="module_CampaignApi..CampaignPayload"></a>

### CampaignApi~CampaignPayload : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| name | <code>string</code> | 
| title | <code>string</code> | 
| targetProfileId | <code>number</code> | 
| organizationId | <code>number</code> | 
| creatorId | <code>number</code> | 
| customLandingPageText | <code>string</code> | 

<a name="module_CampaignApi..UserNotAuthorizedToCreateCampaignError"></a>

### CampaignApi~UserNotAuthorizedToCreateCampaignError : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| message | <code>string</code> | 

<a name="module_CampaignApi..UpdateCampaignPayload"></a>

### CampaignApi~UpdateCampaignPayload : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| campaignId | <code>number</code> | 
| name | <code>string</code> | 
| title | <code>string</code> | 
| customLandingPageText | <code>string</code> | 

<a name="module_CampaignApi..PageDefinition"></a>

### CampaignApi~PageDefinition : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| size | <code>number</code> | 
| number | <code>Page</code> | 

<a name="module_CampaignApi..CampaignListPayload"></a>

### CampaignApi~CampaignListPayload : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| organizationId | <code>number</code> | 
| page | <code>PageDefinition</code> | 

<a name="module_CampaignApi..Pagination"></a>

### CampaignApi~Pagination : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| page | <code>number</code> | 
| pageSize | <code>number</code> | 
| rowCount | <code>number</code> | 
| pageCount | <code>number</code> | 

<a name="module_CampaignApi..CampaignListResponse"></a>

### CampaignApi~CampaignListResponse : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| models | <code>Array.&lt;CampaignListItem&gt;</code> | 
| meta | <code>Pagination</code> | 

<a name="module_OrganizationLearnerApi"></a>

## OrganizationLearnerApi

* [OrganizationLearnerApi](#module_OrganizationLearnerApi)
    * [~find(payload)](#module_OrganizationLearnerApi..find) ⇒ <code>Promise.&lt;OrganizationLearnerListResponse&gt;</code>
    * [~get(organizationLearnerId)](#module_OrganizationLearnerApi..get) ⇒ <code>Promise.&lt;OrganizationLearner&gt;</code>
    * [~PageDefinition](#module_OrganizationLearnerApi..PageDefinition) : <code>object</code>
    * [~FilterDefinition](#module_OrganizationLearnerApi..FilterDefinition) : <code>object</code>
    * [~OrganizationLearnerListPayload](#module_OrganizationLearnerApi..OrganizationLearnerListPayload) : <code>object</code>
    * [~Pagination](#module_OrganizationLearnerApi..Pagination) : <code>object</code>
    * [~OrganizationLearner](#module_OrganizationLearnerApi..OrganizationLearner) : <code>object</code>
    * [~OrganizationLearnerListResponse](#module_OrganizationLearnerApi..OrganizationLearnerListResponse) : <code>object</code>

<a name="module_OrganizationLearnerApi..find"></a>

### OrganizationLearnerApi~find(payload) ⇒ <code>Promise.&lt;OrganizationLearnerListResponse&gt;</code>
Récupère les organization-learners pour une organization. Par défaut, ces organizations-learners sont triés par prénom puis par nom.
Si le params 'page' est présent, les organization-learners seront paginés
Si le params 'filter' est présent, les organization-learners seront filtrés

**Kind**: inner method of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  

| Param | Type |
| --- | --- |
| payload | <code>OrganizationLearnerListPayload</code> | 

<a name="module_OrganizationLearnerApi..get"></a>

### OrganizationLearnerApi~get(organizationLearnerId) ⇒ <code>Promise.&lt;OrganizationLearner&gt;</code>
**Kind**: inner method of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  

| Param | Type |
| --- | --- |
| organizationLearnerId | <code>number</code> | 

<a name="module_OrganizationLearnerApi..PageDefinition"></a>

### OrganizationLearnerApi~PageDefinition : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name | Type |
| --- | --- |
| size | <code>number</code> | 
| number | <code>Page</code> | 

<a name="module_OrganizationLearnerApi..FilterDefinition"></a>

### OrganizationLearnerApi~FilterDefinition : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name | Type |
| --- | --- |
| divisions | <code>Array.&lt;string&gt;</code> | 
| name | <code>string</code> | 

<a name="module_OrganizationLearnerApi..OrganizationLearnerListPayload"></a>

### OrganizationLearnerApi~OrganizationLearnerListPayload : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Propery**: <code>(FilterDefinition\|undefined)</code> filter  
**Properties**

| Name | Type |
| --- | --- |
| organizationId | <code>number</code> | 
| page | <code>PageDefinition</code> \| <code>undefined</code> | 

<a name="module_OrganizationLearnerApi..Pagination"></a>

### OrganizationLearnerApi~Pagination : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name | Type |
| --- | --- |
| page | <code>number</code> | 
| pageSize | <code>number</code> | 
| rowCount | <code>number</code> | 
| pageCount | <code>number</code> | 

<a name="module_OrganizationLearnerApi..OrganizationLearner"></a>

### OrganizationLearnerApi~OrganizationLearner : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name | Type |
| --- | --- |
| id | <code>number</code> | 
| firstName | <code>string</code> | 
| lastName | <code>string</code> | 
| division | <code>string</code> | 
| organizationId | <code>number</code> | 

<a name="module_OrganizationLearnerApi..OrganizationLearnerListResponse"></a>

### OrganizationLearnerApi~OrganizationLearnerListResponse : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name | Type |
| --- | --- |
| organizationLearners | <code>Array.&lt;OrganizationLearner&gt;</code> | 
| pagination | <code>Pagination</code> \| <code>undefined</code> | 

<a name="module_OrganizationLearnerWithParticipationsApi"></a>

## OrganizationLearnerWithParticipationsApi

* [OrganizationLearnerWithParticipationsApi](#module_OrganizationLearnerWithParticipationsApi)
    * [~find(payload)](#module_OrganizationLearnerWithParticipationsApi..find) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearnerWithParticipations&gt;&gt;</code>
    * [~FindPayload](#module_OrganizationLearnerWithParticipationsApi..FindPayload) : <code>object</code>
    * [~OrganizationLearner](#module_OrganizationLearnerWithParticipationsApi..OrganizationLearner) : <code>object</code>
    * [~Organization](#module_OrganizationLearnerWithParticipationsApi..Organization) : <code>object</code>
    * [~CampaignParticipation](#module_OrganizationLearnerWithParticipationsApi..CampaignParticipation) : <code>object</code>
    * [~OrganizationLearnerWithParticipations](#module_OrganizationLearnerWithParticipationsApi..OrganizationLearnerWithParticipations) : <code>object</code>

<a name="module_OrganizationLearnerWithParticipationsApi..find"></a>

### OrganizationLearnerWithParticipationsApi~find(payload) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearnerWithParticipations&gt;&gt;</code>
Récupère les organizations-learners avec leurs participations à partir d'une liste d'ids d'utilisateurs

**Kind**: inner method of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)  

| Param | Type |
| --- | --- |
| payload | <code>FindPayload</code> | 

<a name="module_OrganizationLearnerWithParticipationsApi..FindPayload"></a>

### OrganizationLearnerWithParticipationsApi~FindPayload : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)  
**Properties**

| Name | Type |
| --- | --- |
| userIds | <code>Array.&lt;number&gt;</code> | 

<a name="module_OrganizationLearnerWithParticipationsApi..OrganizationLearner"></a>

### OrganizationLearnerWithParticipationsApi~OrganizationLearner : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)  
**Properties**

| Name | Type |
| --- | --- |
| id | <code>number</code> | 
| MEFCode | <code>string</code> | 

<a name="module_OrganizationLearnerWithParticipationsApi..Organization"></a>

### OrganizationLearnerWithParticipationsApi~Organization : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)  
**Properties**

| Name | Type |
| --- | --- |
| isManagingStudents | <code>boolean</code> | 
| tags | <code>Array.&lt;string&gt;</code> | 
| type | <code>string</code> | 

<a name="module_OrganizationLearnerWithParticipationsApi..CampaignParticipation"></a>

### OrganizationLearnerWithParticipationsApi~CampaignParticipation : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)  
**Properties**

| Name | Type |
| --- | --- |
| targetProfileId | <code>number</code> | 

<a name="module_OrganizationLearnerWithParticipationsApi..OrganizationLearnerWithParticipations"></a>

### OrganizationLearnerWithParticipationsApi~OrganizationLearnerWithParticipations : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)  
**Properties**

| Name | Type |
| --- | --- |
| organizationLearner | <code>OrganizationLearner</code> | 
| organization | <code>Organization</code> | 
| campaignParticipations | <code>Array.&lt;CampaignParticipation&gt;</code> | 

<a name="module_TargetProfileApi"></a>

## TargetProfileApi

* [TargetProfileApi](#module_TargetProfileApi)
    * [~getByOrganizationId(organizationId)](#module_TargetProfileApi..getByOrganizationId) ⇒ <code>Promise.&lt;Array.&lt;TargetProfile&gt;&gt;</code>
    * [~getById(id)](#module_TargetProfileApi..getById) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>

<a name="module_TargetProfileApi..getByOrganizationId"></a>

### TargetProfileApi~getByOrganizationId(organizationId) ⇒ <code>Promise.&lt;Array.&lt;TargetProfile&gt;&gt;</code>
**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)  

| Param | Type |
| --- | --- |
| organizationId | <code>number</code> | 

<a name="module_TargetProfileApi..getById"></a>

### TargetProfileApi~getById(id) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>
**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 


