# User Study Dumb Charades Website

The goal of the website is to conduct a user study for finding actions appropriate for Dumb Charades

# Installation 
## Install Node & NPM
```
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
```

## Clone Repo 
```
git clone https://github.com/shubhMaheshwari/DumbCharades.git
```

## Install mongo db
    Do it yourself

## Install packages
```
cd DumbCharades
npm install 
```

## Link your bvh folder to static 
```
cd static 
ln -s <path to bvh files> bvh_models
```

# Run script
```
cd scripts
./run.sh 
```

# Routes 
```
/ => home page where each bvh file will load
/list => json submitted by users
/submi_answer => post route to accept user submission
/auth/google => google login page
/auth/google/return => return url aftere google login 
```