import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { LinkTo } from '@ember/routing';

import formatDate from '../../helpers/format-date';

<template>
  <div class="content-text content-text--small">
    <div class="table-admin">
      <table>
        <caption class="screen-reader-only">Liste des parcours autonomes</caption>
        <thead>
          <tr>
            <th scope="col" class="table__column table__column--id">Id</th>
            <th scope="col">Nom</th>
            <th scope="col" class="table__column table__medium">Date de création</th>
            <th scope="col" class="table__column table__medium">Statut</th>
          </tr>
        </thead>

        {{#if @items}}
          <tbody>
            {{#each @items as |autonomousCourseListItem|}}
              <tr>
                <td>
                  {{autonomousCourseListItem.id}}
                </td>
                <td>
                  <LinkTo
                    @route="authenticated.autonomous-courses.autonomous-course"
                    @model={{autonomousCourseListItem.id}}
                  >
                    {{autonomousCourseListItem.name}}
                  </LinkTo>
                </td>
                <td>
                  {{formatDate autonomousCourseListItem.createdAt}}
                </td>
                <td>
                  {{#if autonomousCourseListItem.archivedAt}}
                    <PixTag @color="grey-light">
                      Archivé
                    </PixTag>
                  {{else}}
                    <PixTag @color="green-light">
                      Actif
                    </PixTag>
                  {{/if}}
                </td>
              </tr>
            {{/each}}
          </tbody>
        {{/if}}
      </table>

      {{#unless @items}}
        <div class="table__empty">Aucun résultat</div>
      {{/unless}}
    </div>
  </div>
</template>
