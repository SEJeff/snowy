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

# TODO: use this exception
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User

from piston.utils import rc
from piston.handler import BaseHandler

from snowy.notes.models import Note
from snowy.notes.models import Share

# Use simplejson or Python 2.6 json, prefer simplejson.
try:
    import simplejson as json
except ImportError:
    import json

# http://domain/user/notes/id/sharing
# http://domain/user/notes/id/slug/sharing
class ShareHandler(BaseHandler):
    allowed_methods = ('PUT', 'POST')
    #model = Share
    #def create(self, request, username, note_id, slug=None):
    #    """
    #    When $.post() is called via jQuery. Unfortunately, HTTP PUT
    #    is not well supported by some browsers and many clients  so
    #    we   overload   POST   to  also  update  checkbox  changes.
    #    """
    #    model = Share
    #    data  = request.POST
    #    attrs = self.flatten_dict(data)
    #    user  = request.user
    #    try:
    #        note = Note.objects.get(pk=note_id)
    #        # Sharing privileges are only for note authors
    #        if note.author != user:
    #            return rc.FORBIDDEN
    #    except self.model.DoesNotExist:
    #        return rc.NOT_FOUND
    #    try:
    #        if attrs.get('email') != None:
    #            # TODO: Add explicit exception handling
    #            email = attrs.get('email')
    #            (model, new) = self.model.objects.get_or_create(email=email, person_sharing=request.user, note=note)
    #            if new:
    #                model.save()
    #                ret = rc.CREATED
    #            else:
    #                ret = rc.ALL_OK
    #    except:
    #        ret = rc.BAD_REQUEST
    #
    #    return ret

    def update(self, request, username, note_id, slug=None):
        """
        PUT updates for public/private
        """
        data  = request.PUT
        attrs = self.flatten_dict(data)
        user  = request.user
        try:
            note = Note.objects.get(pk=note_id)
            # Sharing privileges are only for note authors
            if note.author != user:
                return rc.FORBIDDEN
        except self.model.DoesNotExist:
            return rc.NOT_FOUND
        try:
            public = attrs.get('public')
            if public != None:
                if public == u'true':
                    note.permissions = 1
                else:
                    note.permissions = 0
                note.save()
                ret = rc.ALL_OK
        except:
            ret = rc.BAD_REQUEST
        return ret
