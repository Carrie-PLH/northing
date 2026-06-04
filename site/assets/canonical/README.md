# Deployment copy — do not edit here

This folder is a copy. The master canonical images live at:

    90 media/Photograph/A-CANONICAL-IMAGES/

The copy exists because the deck builder and site tooling need these images
at relative paths inside `site/`. If a canonical image ever changes (a canon
revision), change it in the master folder and refresh this copy with:

    scripts/sync-canonical.sh

Verify the copy without changing anything:

    scripts/sync-canonical.sh --check
