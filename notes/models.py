#
# Copyright (c) 2009 Brad Taylor <brad@getcoded.net>
#
# This program is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, either version 3 of the License, or (at your option) any
# later version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

import datetime
from django.utils.translation import ugettext_lazy as _
from django.db.models.signals import pre_save
from django.contrib.auth.models import User
from django.db import models
from django.conf import settings

from autoslug.fields import AutoSlugField

from snowy.core.utils import create_uuid
from snowy.notes.managers import NoteManager

class Note(models.Model):
    NOTE_PERMISSIONS = (
        (0, _(u'Private')), (1, _(u'Public')),
    )

    guid = models.CharField(max_length=36)

    author = models.ForeignKey(User)

    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now_add=True)
    user_modified = models.DateTimeField(auto_now_add=True)

    title = models.TextField(blank=True)
    slug = AutoSlugField(unique_with='author', populate_from='title',
                         editable=True)
    content = models.TextField(blank=True)
    content_version = models.CharField(max_length=10, blank=True)

    tags = models.ManyToManyField('NoteTag', null=True, blank=True)
    permissions = models.IntegerField(choices=NOTE_PERMISSIONS,
                                      default=0)

    open_on_startup = models.BooleanField(default=False)
    pinned = models.BooleanField(default=False)

    last_sync_rev = models.IntegerField(default=-1)

    objects = NoteManager()

    class Meta:
        get_latest_by = 'user_modified'
        unique_together = (('author', 'guid'), )

    def __unicode__(self):
        return self.title

    @models.permalink
    def get_absolute_url(self):
        if self.slug == "":
            return ('note_detail_no_slug', (), {
                'note_id': self.id,
                'username': self.author.username,
            })
        else:
            return ('note_detail', (), {
                'note_id': self.id,
                'username': self.author.username,
                'slug': self.slug,
            })


class NoteTag(models.Model):
    author = models.ForeignKey(User)
    name = models.CharField(max_length=255)
    is_notebook = models.BooleanField(default=False)

    class Meta:
        unique_together = ('author', 'name')

    def __unicode__(self):
        return self.name

    def _note_is_public(self):
        # This will need to be expanded once a more
        # fine-grained permissions system is in place.
        if self.note_set.filter(permissions__gt=0).count():
            return True
        else:
            return False

    def get_name_for_display(self):
        if self.is_notebook:
            return self.name.split(':', 2)[-1]
        return self.name

    is_public = property(_note_is_public)

class Share(models.Model):
    person_sharing = models.ForeignKey(User, related_name='requestor')
    person_rcvx    = models.ForeignKey(User, related_name='receiver', blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    note = models.ForeignKey(Note)
    notified = models.BooleanField(default=False, help_text="notification sent")
    # Same as in Note.guid
    token = models.CharField(max_length=36, default=create_uuid)

    def is_expired(self):
        """
	Find out if a Share is expired
	"""
        days = (datetime.datetime.now() - self.created).days
        if days > getattr(settings, "SNOWY_INVITE_EXPIRATION", 30):
	    return True
	else:
	    return False

    def is_active(self):
        """
	Funky logic to see if a receiving person has created a user
	"""
        return not self.person_rcvx is None

    def __unicode__(self):
        message = "%s sharing: '%s" % (self.person_sharing.username, self.note.title)
	if self.person_rcvx:
	    message += "' with %s" % self.person_rcvx
	else:
	    message += "'"
	return message

def _update_is_notebook(sender, instance, **kwargs):
    """
    Update is_notebook based upon the NoteTag name.
    """
    instance.is_notebook = instance.name.startswith('system:notebook:')

pre_save.connect(_update_is_notebook, sender=NoteTag,
                 dispatch_uid='snowy.notes.models.NoteTag')
