import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { LinkTo } from '@ember/routing';

import formatDate from '../../../helpers/format-date';

<template>
  <tr>
    <td>
      {{@item.id}}
    </td>
    <td>
      <LinkTo @route="authenticated.autonomous-courses.autonomous-course" @model={{@item.id}}>
        {{@item.name}}
      </LinkTo>
    </td>
    <td>
      {{formatDate @item.createdAt}}
    </td>
    <td>
      {{#if @item.archivedAt}}
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
</template>
