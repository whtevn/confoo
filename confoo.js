// recursively search for a config file
// could abstract this out into its own package
// will be useful for deploy tool
function findConfig(name, level){
  // check to see if the level we are at is a directory
  return fs.isDirectory(level)
    .then(function(is_directory){
      var dir_options = ['/.'+name, '/'+name, '/etc/'+name, '/etc/.'+name];
      if(is_directory){
        // make an array of promises to return whether or not each option is a file on this level
        is_file = dir_options.map(function(opt){
          // check to see if any of the options for a migrit.json file exist on this level
          return fs.isFile(level+opt);
        });

        return q.all(is_file)
          .then(function(is_file){
            // if any of this options are found on this level, return the location of the file
            // locate the working dir_option by finding the first place the is_file array is `true`
            // it is possible to find more than one migrit.json file is found, but they will be loaded
            // by preference according to the order of the array
            return level+dir_options[is_file.indexOf(true)];
          });
      }else{
        // otherwise, throw an error
        throw('no config file found'); 
      }
    })
    .then(function(is_file){
      if(is_file){
        // if the file was found
        return is_file
      }else{
        // if no file was found, try one level higher
        return findConfig(name, defaults, level+'/..');
      }
    })
    .fail(function(err){
      // console log any errors
      console.log(err);
    });
}

function getConfig(name, defaults){
  return findConfig(name)
    .then(function(file){
      fs.read(file)
          .then(function(contents){
            var regex = new RegExp('\.?'+name)
            contents = JSON.parse(contents); 
            contents = _.extend(defaults, contents);
            contents.__basedir = is_file.replace(regex, '');
            return contents;
          });
    })
}

module.exports = {
  find: findConfig
, get: getConfig
};

