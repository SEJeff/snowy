#
# Copyright (c) 2010 Jeff Schroeder <jeffschroeder@computer.org>
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

from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Max

# TODO: Is AnonymousBaseHandler necessary?
from piston.handler import AnonymousBaseHandler, BaseHandler
from piston.utils import rc, HttpStatusCode

from datetime import datetime

from snowy.core.urlresolvers import reverse_full
from snowy.notes.models import Note
from snowy.notes.models import Share
from snowy import settings

# Use simplejson or Python 2.6 json, prefer simplejson.
try:
    import simplejson as json
except ImportError:
    import json

# http://domain/user/notes/id/sharing
# http://domain/user/notes/id/slug/sharing
class ShareHandler(BaseHandler):
    allowed_methods = ('GET', 'PUT', 'POST')
    model = Share

    def read(self, request, username, note_id, slug=None):
        author = User.objects.get(username=username)
        note = Note.objects.get(pk=note_id, author=author)
        if request.user != author and note.permissions == 0:
            return rc.FORBIDDEN

        share_users = []
        share_emails = []
        shares = Share.objects.filter(person_sharing=author, note=note)
        if shares:
            for s in shares:
                username = getattr(s.person_rcvx, 'username', None)
                if username:
                    share_users.append(username)
                else:
                    email = getattr(s, 'email', '_BOGUS@EMAIL_')
                    share_emails.append(email)
        else:
            share_users = []

        # TODO: shared_with is users that have a 2 way agreed upon sharing relationship
        # TODO: Add in support for 'in-progress' sharing requests
        return {
            'shared_with': share_users,
            'invitations': share_emails,
        }

    def create(self, request, username, note_id, slug=None):
        # TODO: Check the security of this fully
        data = request.POST
        attrs = self.flatten_dict(data)
        # TODO: Fail on invalid note ids
        note = Note.objects.get(pk=note_id)
        # TODO: Wrap in try/except
        (model, ret) = self.model.objects.get_or_create(email=attrs['email'], person_sharing=request.user, note=note)
        #pdb.set_trace()
        # TODO: Check the return of this call and return the rc.WHATEVER thingy
        if ret:
            model.save()
        #pdb.set_trace()
