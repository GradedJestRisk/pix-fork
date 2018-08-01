#!/usr/bin/env bash

set -e
set -u
set -x

function extract_issue_id_from_branch_name() {
    USER_STORY_BRANCH_NAME=$1
    echo $USER_STORY_BRANCH_NAME | grep --perl-regexp --only-matching '^\w+-\d+' | tr '[:lower:]' '[:upper:]'
}

API_VERSION="2"
API_URL="https://1024pix.atlassian.net/rest/api/$API_VERSION"

CREDENTIALS="$JIRA_API_KEY:$JIRA_API_SECRET"
ISSUE_ID=$(extract_issue_id_from_branch_name $CIRCLE_BRANCH)

RESPONSE=$(curl "$API_URL/issue/$ISSUE_ID/comment" --user $CREDENTIALS --fail)

if [[ $? != 0 ]]
then
    echo "The id of the Jira issue could not be found. Stopping here."
    exit 0
fi

ISSUE_COMMENTS=$(echo $RESPONSE | jq .comments[].body)
PR_NUMBER=`echo $CI_PULL_REQUEST | grep -Po '(?<=pix/pull/)(\d+)'`
RA_MON_PIX_URL="https://pix-mon-pix-integration-pr$PR_NUMBER.scalingo.io"
RA_ORGA_URL="https://pix-orga-integration-pr$PR_NUMBER.scalingo.io"
RA_API_URL="https://pix-api-integration-pr$PR_NUMBER.scalingo.io"

if [[ $ISSUE_COMMENTS =~ .*$RA_MON_PIX_URL.* ]]
then
    echo "Review app url already found in issue comments. No need to add it again"
else
    TEXT="Je m'apprête à déployer la Review App. Elle sera consultable sur les URL suivantes:\n- Mon Pix: $RA_MON_PIX_URL\n- Orga: $RA_ORGA_URL\n- API: $RA_API_URL"
    curl -X POST "$API_URL/issue/$ISSUE_ID/comment" --header 'Content-Type: application/json' --fail --user $CREDENTIALS --data '{"body": "'"$TEXT"'"}'
fi
