#!/usr/bin/env sh
echo "Command: $1" 
if [ "$1" != "" ]; then 
    echo "Deploying to github & heroku with commit message: "
    echo $1
    echo "Staging for commit"
    git add .
    echo "Commiting"
    git commit -m "$1"
    echo "Pushing to github"
    git push
    echo "Pushing to Heroku"
    git push heroku master
    echo "Success"

else
    echo "Please leave a commit message"
fi