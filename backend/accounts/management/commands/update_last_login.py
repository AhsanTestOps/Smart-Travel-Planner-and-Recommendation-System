from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.utils import timezone


class Command(BaseCommand):
    help = 'Update last_login for users who have tokens but no last_login timestamp'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )

    def handle(self, *args, **options):
        # Find users who have tokens but no last_login
        users_to_update = User.objects.filter(
            auth_token__isnull=False,
            last_login__isnull=True
        )
        
        self.stdout.write(f"Found {users_to_update.count()} users with tokens but no last_login")
        
        if options['dry_run']:
            for user in users_to_update:
                token = Token.objects.get(user=user)
                self.stdout.write(f"Would update: {user.email} (token created: {token.created})")
        else:
            updated_count = 0
            for user in users_to_update:
                token = Token.objects.get(user=user)
                # Set last_login to the token creation time
                user.last_login = token.created
                user.save(update_fields=['last_login'])
                updated_count += 1
                self.stdout.write(f"Updated: {user.email}")
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated {updated_count} users')
            )
            
        # Also show current status
        total_users = User.objects.count()
        users_with_tokens = User.objects.filter(auth_token__isnull=False).count()
        users_with_last_login = User.objects.filter(last_login__isnull=False).count()
        
        self.stdout.write(f"\nCurrent status:")
        self.stdout.write(f"Total users: {total_users}")
        self.stdout.write(f"Users with tokens: {users_with_tokens}")
        self.stdout.write(f"Users with last_login: {users_with_last_login}")
