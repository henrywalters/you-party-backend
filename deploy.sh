#!/usr/bin/env sh
echo "Command: $1" 
if [ "$1" != "" ]; then 
    echo "Compiling...."
    tsc
    echo "Deploying to github & heroku with commit message: "
    echo $1
    if [ -n "$(git status --porcelain)" ]; then
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
        echo "No changes detected. Ending Process";
    fi

else
    echo "Please leave a commit message"
fi