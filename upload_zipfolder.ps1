# Param([string]$skillname)

if(-not (Test-Path -Path "..\procon2019_teamG" -PathType Container)){
  echo "error 1"
  exit 1
}

if(-not (Test-Path -Path ".\node_modules" -PathType Container)){
  echo "error 2"
  exit 2
}

# if(-not (Test-Path "" -Path Type Container)){
#   exit 3
# }


# Compress-Archive -Path ./ .
